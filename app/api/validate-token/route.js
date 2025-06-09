// app/api/validate-token/route.js
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

// GET /api/validate-token?token=xxx - Validate token and get contract details
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 })
  }

  const conn = await getConnection()
  try {
    // Get contract by token
    const [contracts] = await conn.execute(
      "SELECT id, interpreter_name, interpreter_email, status FROM contracts WHERE token = ?",
      [token]
    )

    if (contracts.length === 0) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 404 })
    }

    const contract = contracts[0]

    // Check if contract is already signed
    if (contract.status === "signed") {
      return NextResponse.json(
        { valid: false, error: "Contract has already been signed" },
        { status: 400 }
      )
    }

    // Check if contract is expired
    if (contract.status === "expired") {
      return NextResponse.json({ valid: false, error: "Contract link has expired" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      contractId: contract.id,
      interpreterName: contract.interpreter_name,
      interpreterEmail: contract.interpreter_email,
    })
  } catch (error) {
    console.error("Error validating token:", error)
    return NextResponse.json({ valid: false, error: "Failed to validate token" }, { status: 500 })
  } finally {
    await conn.end()
  }
}