// app/api/save-contract/route.js
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

// POST /api/save-contract - Save a signed contract
export async function POST(request) {
  const conn = await getConnection()
  try {
    const data = await request.json()
    const { contractId, pdfData, bankingInfo, signatureData } = data

    if (!contractId || !pdfData) {
      return NextResponse.json(
        { error: "Contract ID and PDF data are required" },
        { status: 400 }
      )
    }

    // Check if contract exists
    const [contracts] = await conn.execute(
      "SELECT id, status FROM contracts WHERE id = ?",
      [contractId]
    )

    if (contracts.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Save contract data
    await conn.execute(
      `UPDATE contracts 
       SET status = 'signed', 
           signed_at = NOW(), 
           pdf_data = ?,
           banking_info = ?,
           signature_data = ?
       WHERE id = ?`,
      [
        pdfData,
        JSON.stringify(bankingInfo || {}),
        JSON.stringify(signatureData || {}),
        contractId,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "Contract saved successfully",
    })
  } catch (error) {
    console.error("Error saving contract:", error)
    return NextResponse.json({ error: "Failed to save contract" }, { status: 500 })
  } finally {
    await conn.end()
  }
}