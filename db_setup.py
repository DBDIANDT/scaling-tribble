#!/usr/bin/env python3
"""
Script de migration pour créer les tables de base de données pour le système de signature électronique.
Utilise MySQL sur Railway.
"""

import os
import sys
import argparse
import uuid
from datetime import datetime
import hashlib
import secrets

import pymysql
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env si présent
load_dotenv()

# Récupérer l'URL de connexion depuis les variables d'environnement ou en argument
def get_db_url():
    # Priorité à l'argument de ligne de commande
    parser = argparse.ArgumentParser(description='Migration de base de données pour le système de signature')
    parser.add_argument('--db-url', help='URL de connexion à la base de données MySQL')
    parser.add_argument('--create-admin', action='store_true', help='Créer un nouvel administrateur')
    args = parser.parse_args()
    
    if args.db_url:
        return args.db_url, args.create_admin
    
    # Sinon, utiliser la variable d'environnement
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("ERREUR: URL de base de données non fournie. Utilisez --db-url ou définissez DATABASE_URL dans .env")
        sys.exit(1)
    
    return db_url, args.create_admin

def parse_db_url(url):
    """Parse l'URL de connexion MySQL au format Railway."""
    # Format typique: mysql://user:password@host:port/database
    if not url.startswith('mysql://'):
        raise ValueError("L'URL doit commencer par mysql://")
    
    auth_host, db = url[8:].split('/', 1)
    if '@' in auth_host:
        auth, host = auth_host.split('@', 1)
        if ':' in auth:
            user, password = auth.split(':', 1)
        else:
            user, password = auth, ''
    else:
        host = auth_host
        user, password = '', ''
    
    if ':' in host:
        host, port = host.split(':', 1)
        port = int(port)
    else:
        port = 3306
    
    return {
        'host': host,
        'user': user,
        'password': password,
        'db': db,
        'port': port
    }

def create_tables(connection):
    """Crée les tables nécessaires dans la base de données."""
    with connection.cursor() as cursor:
        # Table des utilisateurs (administrateurs)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            salt VARCHAR(64) NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        
        # Table des contrats
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contracts (
            id VARCHAR(36) PRIMARY KEY,
            interpreter_name VARCHAR(100) NOT NULL,
            interpreter_email VARCHAR(100) NOT NULL,
            status ENUM('draft', 'sent', 'signed', 'expired') DEFAULT 'draft',
            token VARCHAR(64) UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            sent_at DATETIME,
            signed_at DATETIME,
            pdf_data LONGTEXT,
            banking_info JSON,
            signature_data JSON,
            created_by VARCHAR(36),
            FOREIGN KEY (created_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        
        # Table pour les sessions (optionnel, pour la gestion des connexions)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            token VARCHAR(64) UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
    
    connection.commit()
    print("Tables créées avec succès!")

def hash_password(password, salt=None):
    """Hache un mot de passe avec un sel, ou génère un nouveau sel si non fourni."""
    if salt is None:
        salt = secrets.token_hex(32)
    
    password_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000  # Nombre d'itérations
    ).hex()
    
    return password_hash, salt

def create_default_users(connection):
    """Crée deux utilisateurs administrateurs par défaut."""
    default_users = [
        {
            'username': 'admin',
            'email': 'admin@dbdit.com',
            'password': 'Admin123!',
            'is_admin': True
        },
        {
            'username': 'manager',
            'email': 'manager@dbdit.com',
            'password': 'Manager123!',
            'is_admin': True
        }
    ]
    
    with connection.cursor() as cursor:
        for user in default_users:
            # Vérifier si l'utilisateur existe déjà
            cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", 
                          (user['username'], user['email']))
            if cursor.fetchone():
                print(f"L'utilisateur {user['username']} existe déjà, ignoré.")
                continue
            
            # Générer le hash du mot de passe
            password_hash, salt = hash_password(user['password'])
            
            # Insérer l'utilisateur
            user_id = str(uuid.uuid4())
            cursor.execute("""
            INSERT INTO users (id, username, email, password_hash, salt, is_admin, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                user['username'],
                user['email'],
                password_hash,
                salt,
                user['is_admin'],
                datetime.now()
            ))
            print(f"Utilisateur {user['username']} créé avec succès!")
    
    connection.commit()

def create_new_admin(connection):
    """Crée un nouvel administrateur en demandant les informations à l'utilisateur."""
    print("\n=== Création d'un nouvel administrateur ===")
    
    username = input("Nom d'utilisateur: ")
    email = input("Email: ")
    password = input("Mot de passe: ")
    confirm_password = input("Confirmer le mot de passe: ")
    
    if password != confirm_password:
        print("Les mots de passe ne correspondent pas!")
        return
    
    with connection.cursor() as cursor:
        # Vérifier si l'utilisateur existe déjà
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", 
                      (username, email))
        if cursor.fetchone():
            print(f"Un utilisateur avec ce nom ou cet email existe déjà!")
            return
        
        # Générer le hash du mot de passe
        password_hash, salt = hash_password(password)
        
        # Insérer l'utilisateur
        user_id = str(uuid.uuid4())
        cursor.execute("""
        INSERT INTO users (id, username, email, password_hash, salt, is_admin, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            username,
            email,
            password_hash,
            salt,
            True,
            datetime.now()
        ))
    
    connection.commit()
    print(f"Administrateur {username} créé avec succès!")

def main():
    db_url, create_admin = get_db_url()
    try:
        db_config = parse_db_url(db_url)
        connection = pymysql.connect(**db_config)
        
        print("Connexion à la base de données réussie!")
        
        # Créer les tables
        create_tables(connection)
        
        # Créer les utilisateurs par défaut
        create_default_users(connection)
        
        # Créer un nouvel administrateur si demandé
        if create_admin:
            create_new_admin(connection)
        
        print("\nMigration terminée avec succès!")
        
    except Exception as e:
        print(f"ERREUR: {e}")
        sys.exit(1)
    finally:
        if 'connection' in locals() and connection:
            connection.close()

if __name__ == "__main__":
    main()