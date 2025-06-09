"use client"

import { useState } from "react"
import { ContractPreview } from "@/components/contract-preview"
import { BankingInformation } from "@/components/banking-information"
import { SignatureCapture } from "@/components/signature-capture"
import { ContractCompletion } from "@/components/contract-completion"
import { StepIndicator } from "@/components/step-indicator"

export default function ElectronicSignatureSystem() {
  const [currentStep, setCurrentStep] = useState(1)
  const [contractData, setContractData] = useState({
    agreed: false,
    bankingInfo: null,
    signature: null,
    signatureType: null,
    completedAt: null,
  })

  const handleStepComplete = (stepData: any) => {
    setContractData((prev) => ({ ...prev, ...stepData }))
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const steps = [
    { number: 1, title: "Contract Review", description: "Review and agree to terms" },
    { number: 2, title: "Banking Information", description: "Provide payment details" },
    { number: 3, title: "Digital Signature", description: "Sign the contract" },
    { number: 4, title: "Completion", description: "Download your contract" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-DCMWenTU-lxV54Jwyvarie63VTDWGG4qmL7WUrs.png"
              alt="DBD I&T Logo"
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Electronic Signature System</h1>
            <p className="text-gray-600">Interpreter Service Agreement - Digital Contract Signing</p>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            {currentStep === 1 && <ContractPreview onComplete={handleStepComplete} />}
            {currentStep === 2 && <BankingInformation onComplete={handleStepComplete} />}
            {currentStep === 3 && <SignatureCapture onComplete={handleStepComplete} />}
            {currentStep === 4 && <ContractCompletion contractData={contractData} />}
          </div>
        </div>
      </div>
    </div>
  )
}
