// app/api/contracts/route.js
import { NextResponse } from "next/server"
import mysql from "mysql2/promise"
import { v4 as uuidv4 } from "uuid"
import nodemailer from "nodemailer"

// Database connection function
async function getConnection() {
  try {
    return await mysql.createConnection(process.env.DATABASE_URL)
  } catch (error) {
    console.error("Failed to connect to database:", error)
    throw new Error("Database connection failed")
  }
}

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// GET /api/contracts - List all contracts
export async function GET(request) {
  const conn = await getConnection()
  try {
    const [rows] = await conn.execute(
      "SELECT id, interpreter_name, interpreter_email, status, created_at, sent_at, signed_at FROM contracts ORDER BY created_at DESC"
    )
    return NextResponse.json({ contracts: rows })
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 })
  } finally {
    await conn.end()
  }
}

// POST /api/contracts - Create a new contract and send link
export async function POST(request) {
  const conn = await getConnection()
  try {
    const data = await request.json()
    const { interpreterName, interpreterEmail } = data

    if (!interpreterName || !interpreterEmail) {
      return NextResponse.json(
        { error: "Interpreter name and email are required" },
        { status: 400 }
      )
    }

    // Create unique token for contract link
    const token = uuidv4()
    const contractId = uuidv4()

    // Insert new contract
    await conn.execute(
      "INSERT INTO contracts (id, interpreter_name, interpreter_email, status, token, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [contractId, interpreterName, interpreterEmail, "draft", token]
    )

    // Generate sign link
    const signLink = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${token}`

    // Send email with sign link
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"DBD I&T" <contracts@dbdit.com>',
      to: interpreterEmail,
      subject: "DBD I&T - Your Interpreter Service Agreement",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="DBD I&T Logo" style="max-width: 200px; margin: 20px 0;">
          <h2>Hello ${interpreterName},</h2>
          <p>Thank you for your interest in working with DBD I&T as an interpreter.</p>
          <p>Please click the link below to review and sign your Interpreter Service Agreement:</p>
          <p style="margin: 30px 0;">
            <a href="${signLink}" style="background-color: #3366cc; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Sign Your Contract
            </a>
          </p>
          <p>This link will expire in 7 days. If you have any questions, please reply to this email.</p>
          <p>Best regards,<br>DBD I&T Team</p>
        </div>
      `,
    })

    // Update contract status to sent
    await conn.execute(
      "UPDATE contracts SET status = 'sent', sent_at = NOW() WHERE id = ?",
      [contractId]
    )

    return NextResponse.json({
      success: true,
      message: "Contract created and email sent successfully",
      contractId,
      token,
    })
  } catch (error) {
    console.error("Error creating contract:", error)
    return NextResponse.json(
      { error: "Failed to create contract or send email" },
      { status: 500 }
    )
  } finally {
    await conn.end()
  }
}