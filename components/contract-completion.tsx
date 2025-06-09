"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Download, Loader2, Eye } from "lucide-react"
import { generateContractPDF } from "@/lib/pdf-generator"
import { PDFPreview } from "@/components/pdf-preview"

interface ContractCompletionProps {
  contractData: any
}

export function ContractCompletion({ contractData }: ContractCompletionProps) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [isApproved, setIsApproved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [pdfContent, setPdfContent] = useState<string | null>(null)

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsProcessing(false)
      setIsApproved(true)

      // Generate PDF content for preview
      generateContractPDF(contractData, true).then((content) => {
        setPdfContent(content)
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [contractData])

  const handleDownload = async () => {
    try {
      await generateContractPDF(contractData)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  if (isProcessing) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Contract</h2>
          <p className="text-gray-600">Please wait while we finalize your agreement...</p>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">✓ Validating signature</div>
          <div className="text-sm text-gray-500">✓ Verifying banking information</div>
          <div className="text-sm text-gray-500">✓ Generating contract document</div>
          <div className="text-sm text-gray-500">⏳ Adding security features...</div>
        </div>
      </div>
    )
  }

  if (isApproved) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Contract Approved!</h2>
          <p className="text-gray-600">
            Your interpreter service agreement has been successfully completed and signed.
          </p>
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Contract ID:</span>
                <span className="font-mono">ISA-{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Signed Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Interpreter:</span>
                <span>{contractData.bankingInfo?.interpreterName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company:</span>
                <span>DBD I&T</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={togglePreview} className="flex-1" variant="outline" size="lg">
              <Eye className="mr-2 h-4 w-4" />
              Preview Document
            </Button>
            <Button onClick={handleDownload} className="flex-1" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>

          {showPreview && pdfContent && <PDFPreview htmlContent={pdfContent} />}

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Your contract includes digital signatures and security metadata</p>
            <p>• A QR code is embedded for authenticity verification</p>
            <p>• Keep this document for your records</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
