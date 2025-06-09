// app/api/contracts/[id]/route.js
import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

async function getConnection() {
  try {
    return await mysql.createConnection(process.env.DATABASE_URL)
  } catch (error) {
    console.error("Failed to connect to database:", error)
    throw new Error("Database connection failed")
  }
}

// GET /api/contracts/[id] - Get a specific contract
export async function GET(request, { params }) {
  const { id } = params
  
  if (!id) {
    return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
  }

  const conn = await getConnection()
  try {
    const [contracts] = await conn.execute(
      `SELECT id, interpreter_name, interpreter_email, status, 
              created_at, sent_at, signed_at, pdf_data 
       FROM contracts 
       WHERE id = ?`,
      [id]
    )

    if (contracts.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    const contract = contracts[0]
    
    return NextResponse.json(contract)
  } catch (error) {
    console.error("Error fetching contract:", error)
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 })
  } finally {
    await conn.end()
  }
}