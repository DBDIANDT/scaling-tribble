#!/usr/bin/env python3
"""
Script d'analyse d'arborescence de projet
Génère un fichier avec la structure complète et le contenu des fichiers
"""

import os
import pathlib
from datetime import datetime
import argparse

def is_text_file(filepath):
    """Détermine si un fichier est un fichier texte lisible"""
    text_extensions = {
        '.txt', '.md', '.py', '.js', '.ts', '.tsx', '.jsx', '.json', '.yaml', '.yml',
        '.xml', '.html', '.htm', '.css', '.scss', '.sass', '.less', '.sql', '.sh',
        '.bat', '.ps1', '.php', '.rb', '.java', '.c', '.cpp', '.h', '.hpp', '.cs',
        '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml', '.r', '.m',
        '.dockerfile', '.gitignore', '.env', '.config', '.conf', '.ini', '.cfg',
        '.toml', '.lock', '.log', '.csv', '.tsv', '.vue', '.svelte', '.astro'
    }
    
    # Vérification par extension
    extension = pathlib.Path(filepath).suffix.lower()
    if extension in text_extensions:
        return True
    
    # Vérification pour les fichiers sans extension (comme Dockerfile, Makefile, etc.)
    filename = pathlib.Path(filepath).name.lower()
    if filename in ['dockerfile', 'makefile', 'rakefile', 'license', 'readme', 'changelog', 'authors']:
        return True
    
    # Test de lecture binaire pour détecter si c'est du texte
    try:
        with open(filepath, 'rb') as f:
            sample = f.read(1024)
            # Si il y a des bytes nuls, c'est probablement binaire
            if b'\x00' in sample:
                return False
            # Essayer de décoder en UTF-8
            sample.decode('utf-8')
            return True
    except:
        return False

def should_skip_directory(dir_name):
    """Détermine si un dossier doit être ignoré"""
    skip_dirs = {
        'node_modules', '.git', '.svn', '.hg', '__pycache__', '.pytest_cache',
        'venv', 'env', '.venv', '.env', 'dist', 'build', '.next', '.nuxt',
        'coverage', '.coverage', '.nyc_output', 'logs', 'tmp', 'temp',
        '.DS_Store', 'Thumbs.db', '.idea', '.vscode', '.vs'
    }
    return dir_name in skip_dirs

def get_file_info(filepath):
    """Récupère les informations d'un fichier"""
    try:
        stat = os.stat(filepath)
        size = stat.st_size
        modified = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
        return f"[{format_size(size)} - {modified}]"
    except:
        return "[info non disponible]"

def format_size(size_bytes):
    """Formate la taille en unités lisibles"""
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes/1024:.1f}KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes/(1024*1024):.1f}MB"
    else:
        return f"{size_bytes/(1024*1024*1024):.1f}GB"

def read_file_content(filepath):
    """Lit le contenu d'un fichier texte"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if len(content) > 50000:  # Limite pour éviter les fichiers trop gros
                return content[:50000] + f"\n\n... [FICHIER TRONQUÉ - Taille totale: {len(content)} caractères] ..."
            return content
    except UnicodeDecodeError:
        try:
            with open(filepath, 'r', encoding='latin-1') as f:
                content = f.read()
                return content[:50000] + "\n\n... [FICHIER TRONQUÉ - Encodage latin-1] ..." if len(content) > 50000 else content
        except:
            return "[ERREUR: Impossible de lire le fichier]"
    except Exception as e:
        return f"[ERREUR: {str(e)}]"

def analyze_directory(root_path, output_file, prefix="", is_last=True, parent_prefix=""):
    """Analyse récursivement un dossier et écrit dans le fichier de sortie"""
    
    try:
        items = sorted(os.listdir(root_path))
        # Séparer dossiers et fichiers
        dirs = [item for item in items if os.path.isdir(os.path.join(root_path, item)) and not should_skip_directory(item)]
        files = [item for item in items if os.path.isfile(os.path.join(root_path, item))]
        
        all_items = dirs + files
        
        for i, item in enumerate(all_items):
            is_last_item = (i == len(all_items) - 1)
            item_path = os.path.join(root_path, item)
            
            # Dessiner l'arborescence
            if is_last_item:
                current_prefix = "└── "
                next_prefix = parent_prefix + "    "
            else:
                current_prefix = "├── "
                next_prefix = parent_prefix + "│   "
            
            if os.path.isdir(item_path):
                # C'est un dossier
                output_file.write(f"{parent_prefix}{current_prefix}📁 {item}/\n")
                analyze_directory(item_path, output_file, prefix + "    ", is_last_item, next_prefix)
            else:
                # C'est un fichier
                file_info = get_file_info(item_path)
                output_file.write(f"{parent_prefix}{current_prefix}📄 {item} {file_info}\n")
                
                # Lire le contenu si c'est un fichier texte
                if is_text_file(item_path):
                    content = read_file_content(item_path)
                    output_file.write(f"{next_prefix}┌─ CONTENU:\n")
                    
                    # Indenter chaque ligne du contenu
                    for line in content.split('\n'):
                        output_file.write(f"{next_prefix}│  {line}\n")
                    
                    output_file.write(f"{next_prefix}└─ FIN DU CONTENU\n\n")
                else:
                    output_file.write(f"{next_prefix}└─ [FICHIER BINAIRE - Contenu non affiché]\n\n")
                    
    except PermissionError:
        output_file.write(f"{parent_prefix}└── [ERREUR: Permission refusée]\n")
    except Exception as e:
        output_file.write(f"{parent_prefix}└── [ERREUR: {str(e)}]\n")

def main():
    parser = argparse.ArgumentParser(description='Analyse l\'arborescence d\'un projet')
    parser.add_argument('path', nargs='?', default='.', help='Chemin du dossier à analyser (défaut: dossier actuel)')
    parser.add_argument('-o', '--output', default='project_structure.txt', help='Fichier de sortie (défaut: project_structure.txt)')
    parser.add_argument('--no-content', action='store_true', help='Ne pas inclure le contenu des fichiers')
    
    args = parser.parse_args()
    
    root_path = os.path.abspath(args.path)
    output_path = args.output
    
    if not os.path.exists(root_path):
        print(f"Erreur: Le chemin '{root_path}' n'existe pas.")
        return
    
    print(f"Analyse du dossier: {root_path}")
    print(f"Fichier de sortie: {output_path}")
    print("Analyse en cours...")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        # En-tête du fichier
        f.write("=" * 80 + "\n")
        f.write("ANALYSE D'ARBORESCENCE DE PROJET\n")
        f.write("=" * 80 + "\n")
        f.write(f"Date d'analyse: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Dossier analysé: {root_path}\n")
        f.write(f"Générateur: Script Python d'analyse d'arborescence\n")
        f.write("=" * 80 + "\n\n")
        
        # Structure du projet
        project_name = os.path.basename(root_path)
        f.write(f"📁 {project_name}/\n")
        
        if args.no_content:
            # Mode sans contenu - juste la structure
            global is_text_file
            original_is_text_file = is_text_file
            is_text_file = lambda x: False  # Force tous les fichiers à être traités comme binaires
        
        analyze_directory(root_path, f, parent_prefix="")
        
        # Pied de page
        f.write("\n" + "=" * 80 + "\n")
        f.write("FIN DE L'ANALYSE\n")
        f.write("=" * 80 + "\n")
    
    print(f"Analyse terminée! Résultat sauvegardé dans: {output_path}")

if __name__ == "__main__":
    main()