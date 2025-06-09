// We'll use a more reliable approach for PDF generation with base64 images
export async function generateContractPDF(contractData: any, previewOnly = false) {
  const contractId = `ISA-${Date.now().toString().slice(-8)}`
  const currentDate = new Date().toLocaleDateString()

  // Load jsPDF dynamically with proper error handling
  let jsPDF: any

  try {
    if (typeof window !== "undefined") {
      if (!(window as any).jspdf) {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        document.head.appendChild(script)

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          setTimeout(reject, 10000) // 10 second timeout
        })
      }

      jsPDF = (window as any).jspdf?.jsPDF || (window as any).jsPDF

      if (!jsPDF) {
        throw new Error("jsPDF failed to load")
      }
    } else {
      throw new Error("Window object not available")
    }
  } catch (error) {
    console.error("Failed to load jsPDF, falling back to HTML method:", error)
    return generateHTMLFallback(contractData, contractId, currentDate, previewOnly)
  }

  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Page dimensions
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    // Convert images to base64
    const logoBase64 = await getImageAsBase64(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-DCMWenTU-lxV54Jwyvarie63VTDWGG4qmL7WUrs.png",
    )
    const signatureBase64 = await getImageAsBase64(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sign-removebg-d6lM2uyLt1QG9ntwX9SUmSNYwrijZZ.png",
    )

    // Generate QR Code
    const qrData = `Contract ID: ${contractId}\nDate: ${currentDate}\nCompany: DBD I&T\nInterpreter: ${contractData.bankingInfo?.interpreterName}`
    const qrCodeBase64 = await getImageAsBase64(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`,
    )

    // Helper functions
    const addHeader = (pageTitle: string, pageNum: number) => {
      // Modern gradient header
      doc.setFillColor(30, 60, 114)
      doc.rect(0, 0, pageWidth, 25, "F")

      // Add gradient effect with multiple rectangles
      for (let i = 0; i < 5; i++) {
        const alpha = 0.1 + i * 0.1
        doc.setFillColor(42, 82, 152, alpha)
        doc.rect(0, i * 2, pageWidth, 2, "F")
      }

      // Add logo if available
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", margin, 5, 15, 15)
        } catch (e) {
          console.log("Logo failed to load")
        }
      }

      // Header text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("DBD I&T", margin + 20, 12)
      doc.setFontSize(10)
      doc.text(pageTitle, margin + 20, 18)

      // Page number with modern styling
      doc.setFontSize(9)
      doc.text(`Page ${pageNum} of 5`, pageWidth - margin - 20, 15)
    }

    const addFooter = (pageNum: number) => {
      const footerY = pageHeight - 15
      doc.setFillColor(30, 60, 114)
      doc.rect(0, footerY, pageWidth, 15, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text("DBD I&T - We're your voice!", margin, footerY + 8)
      doc.text(`© ${new Date().getFullYear()} DBD I&T. All rights reserved.`, margin, footerY + 12)
    }

    const addModernBox = (
      x: number,
      y: number,
      width: number,
      height: number,
      title: string,
      content: any[],
      hasIcon = false,
    ) => {
      // Modern box with shadow effect
      doc.setFillColor(245, 247, 250)
      doc.rect(x + 1, y + 1, width, height, "F") // Shadow

      doc.setFillColor(255, 255, 255)
      doc.rect(x, y, width, height, "F")

      // Border with gradient effect
      doc.setDrawColor(30, 60, 114)
      doc.setLineWidth(0.5)
      doc.rect(x, y, width, height)

      // Top accent bar
      doc.setFillColor(30, 60, 114)
      doc.rect(x, y, width, 8, "F")

      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(title, x + 5, y + 6)

      // Content
      let contentY = y + 15
      doc.setTextColor(51, 51, 51)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      content.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold")
        doc.setTextColor(30, 60, 114)
        doc.text(label, x + 5, contentY)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(51, 51, 51)
        doc.text(value, x + 45, contentY)
        contentY += 6
      })
    }

    // PAGE 1: Cover Page
    addHeader("INTERPRETER SERVICE AGREEMENT", 1)

    let yPos = 35

    // Modern title section
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, yPos, contentWidth, 25, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.3)
    doc.rect(margin, yPos, contentWidth, 25)

    doc.setTextColor(30, 60, 114)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("INTERPRETER SERVICE AGREEMENT", margin + 5, yPos + 10)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Contract ID: ${contractId}`, margin + 5, yPos + 18)

    const timestamp = new Date().toISOString()
    doc.setFontSize(10)
    doc.text(`Generated: ${timestamp}`, margin + 5, yPos + 24)

    yPos += 35

    // Modern two-column contract information
    const leftBoxWidth = (contentWidth - 10) / 2
    const rightBoxWidth = leftBoxWidth

    // Company Information Box
    const companyInfo = [
      ["Company:", "DBD I&T"],
      ["Address:", "500 GROSSMAN DR"],
      ["City:", "BRAINTREE, MA, 02184"],
      ["Phone:", "774-508-0492"],
      ["Email:", "contact@dbdit.com"],
    ]

    addModernBox(margin, yPos, leftBoxWidth, 50, "COMPANY INFORMATION", companyInfo)

    // Interpreter Information Box
    const interpreterInfo = [
      ["Name:", contractData.bankingInfo?.interpreterName || "N/A"],
      ["Email:", contractData.bankingInfo?.email || "N/A"],
      ["Phone:", contractData.bankingInfo?.phoneNumber || "N/A"],
      ["Address:", contractData.bankingInfo?.address || "N/A"],
    ]

    addModernBox(margin + leftBoxWidth + 10, yPos, rightBoxWidth, 50, "INTERPRETER INFORMATION", interpreterInfo)

    // QR Code with modern styling
    if (qrCodeBase64) {
      try {
        // QR Code background
        doc.setFillColor(255, 255, 255)
        doc.rect(pageWidth - margin - 35, yPos + 55, 35, 35, "F")
        doc.setDrawColor(30, 60, 114)
        doc.setLineWidth(0.5)
        doc.rect(pageWidth - margin - 35, yPos + 55, 35, 35)

        doc.addImage(qrCodeBase64, "PNG", pageWidth - margin - 32, yPos + 58, 29, 29)

        doc.setFontSize(8)
        doc.setTextColor(30, 60, 114)
        // Supprimer le texte "Scan for verification" sous le QR code
        // Ligne à supprimer:
        //doc.text("Scan for verification", pageWidth - margin - 32, yPos + 95)
      } catch (e) {
        console.log("QR Code failed to load")
      }
    }

    yPos += 65

    // Modern styled agreement overview
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, yPos, contentWidth - 40, 60, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.3)
    doc.rect(margin, yPos, contentWidth - 40, 60)

    // Left accent line
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, 3, 60, "F")

    yPos += 10
    doc.setTextColor(30, 60, 114)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Agreement Overview", margin + 8, yPos)

    yPos += 8
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    // Styled bullet points
    const overviewPoints = [
      "• Establishes professional relationship between DBD I&T and the Interpreter",
      "• Outlines terms, conditions, and responsibilities for interpretation services",
      "• Defines compensation structure and payment terms",
      "• Sets professional conduct expectations and confidentiality requirements",
      "• Creates legally binding agreement upon digital signature",
    ]

    overviewPoints.forEach((point) => {
      doc.text(point, margin + 8, yPos)
      yPos += 6
    })

    yPos += 15
    // Encadré d'acceptation avec le même style que Direct Deposit Authorization
    doc.setFillColor(240, 248, 255)
    doc.rect(margin, yPos, contentWidth - 40, 30, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPos, contentWidth - 40, 30)

    // Left accent
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, 3, 30, "F")

    yPos += 8
    doc.setTextColor(30, 60, 114)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Acceptance of Terms", margin + 8, yPos)

    yPos += 8
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const acceptanceText = `By signing this agreement, both parties acknowledge full understanding and acceptance of all terms and conditions outlined in this document.`
    const splitAcceptanceText = doc.splitTextToSize(acceptanceText, contentWidth - 55)
    doc.text(splitAcceptanceText, margin + 8, yPos)

    addFooter(1)

    // PAGE 2: Terms and Conditions
    doc.addPage()
    addHeader("TERMS AND CONDITIONS", 2)

    yPos = 35

    const terms = [
      {
        title: "1. Scope of Services",
        content:
          "The Interpreter agrees to provide professional interpretation services for the Company, including on-site interpretation, oral interpretation, written translation, and any other language-related services as required.",
      },
      {
        title: "2. Independent Contractor Relationship",
        content:
          "The Interpreter acknowledges that they are an independent contractor and not an employee of the Company. The Interpreter shall be responsible for their own taxes, insurance, and other expenses.",
      },
      {
        title: "3. Scheduling and Cancellations",
        content:
          "Interpreters are required to arrive on-site at least fifteen (15) minutes before the scheduled start time. Cancellations require at least forty-eight (48) hours notice.",
      },
      {
        title: "4. Confidentiality",
        content:
          "The Interpreter agrees to maintain the confidentiality of all client and company information and not to disclose any proprietary or sensitive information.",
      },
      {
        title: "5. Code of Conduct",
        content:
          "The Interpreter shall uphold professional ethics, including accuracy, impartiality, and neutrality, and shall not engage in any conduct that may harm the Company's reputation.",
      },
    ]

    terms.forEach((term) => {
      if (yPos > 250) {
        doc.addPage()
        addHeader("TERMS AND CONDITIONS (CONT.)", 2)
        yPos = 35
      }

      // Modern term styling
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos - 2, contentWidth, 6, "F")

      doc.setTextColor(30, 60, 114)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(term.title, margin + 2, yPos + 2)
      yPos += 10

      doc.setTextColor(51, 51, 51)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const splitContent = doc.splitTextToSize(term.content, contentWidth - 4)
      doc.text(splitContent, margin + 2, yPos)
      yPos += splitContent.length * 4 + 12
    })

    addFooter(2)

    // PAGE 3: Compensation
    doc.addPage()
    addHeader("COMPENSATION STRUCTURE", 3)

    yPos = 35

    // Modern compensation header
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, contentWidth, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Compensation Structure", margin + 5, yPos + 8)
    yPos += 20

    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("The Company agrees to pay the Interpreter at the following rates, payable every two weeks:", margin, yPos)
    yPos += 15

    // Modern compensation table
    const rates = [
      ["Language", "Rate (per hour)"],
      ["Portuguese", "$35"],
      ["Spanish", "$30"],
      ["Haitian Creole", "$30"],
      ["Cape Verdean", "$30"],
      ["French", "$35"],
      ["Mandarin", "$40"],
      ["Rare Languages", "$45"],
    ]

    // Table with modern styling
    const tableY = yPos
    const rowHeight = 8
    const colWidth = contentWidth / 2

    // Header row
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, tableY, contentWidth, rowHeight, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text(rates[0][0], margin + 5, tableY + 5)
    doc.text(rates[0][1], margin + colWidth + 5, tableY + 5)

    // Data rows with alternating colors
    for (let i = 1; i < rates.length; i++) {
      const currentY = tableY + i * rowHeight

      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(margin, currentY, contentWidth, rowHeight, "F")
      }

      doc.setDrawColor(224, 224, 224)
      doc.setLineWidth(0.2)
      doc.rect(margin, currentY, contentWidth, rowHeight)
      doc.rect(margin + colWidth, currentY, colWidth, rowHeight)

      doc.setTextColor(51, 51, 51)
      doc.setFont("helvetica", "normal")
      doc.text(rates[i][0], margin + 5, currentY + 5)
      doc.setFont("helvetica", "bold")
      doc.text(rates[i][1], margin + colWidth + 5, currentY + 5)
    }

    yPos = tableY + rates.length * rowHeight + 15

    // Payment terms in modern box
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, yPos, contentWidth, 25, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.3)
    doc.rect(margin, yPos, contentWidth, 25)

    yPos += 8
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const paymentTerms = `Each appointment is scheduled for a minimum of two (2) hours. The Interpreter will be compensated for the full two-hour duration even if the appointment ends earlier.`
    const splitPaymentTerms = doc.splitTextToSize(paymentTerms, contentWidth - 10)
    doc.text(splitPaymentTerms, margin + 5, yPos)

    addFooter(3)

    // PAGE 4: Banking Information
    doc.addPage()
    addHeader("BANKING INFORMATION", 4)

    yPos = 35

    // Modern banking header
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, contentWidth, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Banking Information for Direct Deposit", margin + 5, yPos + 8)
    yPos += 25

    // Modern banking info box with enhanced styling
    const bankingInfo = [
      ["Bank Name:", contractData.bankingInfo?.bankName || "N/A"],
      ["Bank Address:", contractData.bankingInfo?.bankAddress || "N/A"],
      ["Account Holder:", contractData.bankingInfo?.accountHolderName || "N/A"],
      ["Account Type:", contractData.bankingInfo?.accountType === "checking" ? "Checking" : "Savings"],
      ["Routing Number:", contractData.bankingInfo?.routingNumber || "N/A"],
      ["Account Number:", contractData.bankingInfo?.accountNumber || "N/A"],
      ["SWIFT Code:", contractData.bankingInfo?.swiftCode || "N/A"],
    ]

    addModernBox(margin, yPos, contentWidth, 70, "SECURE BANKING DETAILS", bankingInfo)

    yPos += 85

    // Authorization section with modern styling
    doc.setFillColor(240, 248, 255)
    doc.rect(margin, yPos, contentWidth, 35, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPos, contentWidth, 35)

    // Left accent
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, 3, 35, "F")

    yPos += 8
    doc.setTextColor(30, 60, 114)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Direct Deposit Authorization", margin + 8, yPos)

    yPos += 8
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const authText = `I hereby authorize DBD I&T to deposit payments directly into my bank account as provided above. I understand that it is my responsibility to ensure that the information provided is correct.`
    const splitAuthText = doc.splitTextToSize(authText, contentWidth - 15)
    doc.text(splitAuthText, margin + 8, yPos)

    addFooter(4)

    // PAGE 5: Signatures
    doc.addPage()
    addHeader("DIGITAL SIGNATURES", 5)

    yPos = 35

    // Modern signature header
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, contentWidth, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Digital Signatures", margin + 5, yPos + 8)
    yPos += 25

    // Signature boxes with modern styling
    const boxWidth = (contentWidth - 10) / 2
    const boxHeight = 70

    // Interpreter signature box
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, yPos, boxWidth, boxHeight, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPos, boxWidth, boxHeight)

    // Header for interpreter box
    doc.setFillColor(30, 60, 114)
    doc.rect(margin, yPos, boxWidth, 10, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("INTERPRETER SIGNATURE", margin + 5, yPos + 7)

    // Signature content
    if (contractData.signatureType === "type" && contractData.signature) {
      doc.setTextColor(30, 60, 114)
      doc.setFontSize(18)
      doc.setFont("helvetica", "italic")
      doc.text(contractData.signature, margin + 5, yPos + 25)
    } else if (contractData.signature && contractData.signatureType !== "type") {
      try {
        doc.addImage(contractData.signature, "PNG", margin + 5, yPos + 15, 30, 15)
      } catch (e) {
        doc.setTextColor(51, 51, 51)
        doc.setFontSize(10)
        doc.text("Digital signature applied", margin + 5, yPos + 25)
      }
    }

    doc.setTextColor(51, 51, 51)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Name: ${contractData.bankingInfo?.interpreterName || "N/A"}`, margin + 5, yPos + 50)
    doc.text(`Date: ${currentDate}`, margin + 5, yPos + 55)
    doc.text(`Method: ${contractData.signatureType || "N/A"}`, margin + 5, yPos + 60)

    // Company signature box
    doc.setFillColor(248, 250, 252)
    doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, "F")
    doc.setDrawColor(30, 60, 114)
    doc.setLineWidth(0.5)
    doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight)

    // Header for company box
    doc.setFillColor(30, 60, 114)
    doc.rect(margin + boxWidth + 10, yPos, boxWidth, 10, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("COMPANY REPRESENTATIVE", margin + boxWidth + 15, yPos + 7)

    // Company signature
    if (signatureBase64) {
      try {
        doc.addImage(signatureBase64, "PNG", margin + boxWidth + 15, yPos + 15, 25, 15)
      } catch (e) {
        doc.setTextColor(51, 51, 51)
        doc.setFontSize(10)
        doc.text("Authorized Signature", margin + boxWidth + 15, yPos + 25)
      }
    }

    doc.setTextColor(51, 51, 51)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Name: DBD I&T Representative", margin + boxWidth + 15, yPos + 50)
    doc.text(`Date: ${currentDate}`, margin + boxWidth + 15, yPos + 55)
    doc.text("Position: Authorized Signatory", margin + boxWidth + 15, yPos + 60)

    addFooter(5)

    // If preview only, return base64 data
    if (previewOnly) {
      return doc.output("datauristring")
    }

    // Save the PDF
    doc.save(`Interpreter_Service_Agreement_${contractId}.pdf`)
    return doc
  } catch (error) {
    console.error("Error generating PDF:", error)
    return generateHTMLFallback(contractData, contractId, currentDate, previewOnly)
  }
}

// Helper function to convert image URL to base64
async function getImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Failed to convert image to base64:", error)
    return ""
  }
}

// Fallback HTML generation function (unchanged)
function generateHTMLFallback(contractData: any, contractId: string, currentDate: string, previewOnly: boolean) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Interpreter Service Agreement - ${contractId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; margin: -20px -20px 20px -20px; }
        .contract-info { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; border: 1px solid #ccc; padding: 20px; min-height: 100px; }
        h1, h2, h3 { color: #1e3c72; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f0f4f8; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INTERPRETER SERVICE AGREEMENT</h1>
        <p>Contract ID: ${contractId}</p>
      </div>

      <div class="contract-info">
        <h3>Contract Information</h3>
        <p><strong>Date:</strong> ${currentDate}</p>
        <p><strong>Company:</strong> DBD I&T</p>
        <p><strong>Interpreter:</strong> ${contractData.bankingInfo?.interpreterName || "N/A"}</p>
        <p><strong>Email:</strong> ${contractData.bankingInfo?.email || "N/A"}</p>
      </div>

      <h2>Terms and Conditions</h2>
      <p>This agreement establishes the professional relationship between DBD I&T and the Interpreter.</p>

      <h3>Banking Information</h3>
      <table>
        <tr><th>Bank Name</th><td>${contractData.bankingInfo?.bankName || "N/A"}</td></tr>
        <tr><th>Account Holder</th><td>${contractData.bankingInfo?.accountHolderName || "N/A"}</td></tr>
        <tr><th>Account Type</th><td>${contractData.bankingInfo?.accountType || "N/A"}</td></tr>
      </table>

      <div class="signature-section">
        <div class="signature-box">
          <h4>Interpreter Signature:</h4>
          ${
            contractData.signatureType === "type"
              ? `<div style="font-family: cursive; font-size: 24px;">${contractData.signature}</div>`
              : `<p>Digital signature applied</p>`
          }
          <p>Date: ${currentDate}</p>
        </div>
        <div class="signature-box">
          <h4>Company Representative:</h4>
          <p>DBD I&T Representative</p>
          <p>Date: ${currentDate}</p>
        </div>
      </div>
    </body>
    </html>
  `

  if (previewOnly) {
    return htmlContent
  }

  // Download as HTML file
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Interpreter_Service_Agreement_${contractId}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return htmlContent
}
