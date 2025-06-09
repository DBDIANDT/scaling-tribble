"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ContractPreview } from "@/components/contract-preview"
import { BankingInformation } from "@/components/banking-information"
import { SignatureCapture } from "@/components/signature-capture"
import { ContractCompletion } from "@/components/contract-completion"
import { StepIndicator } from "@/components/step-indicator"
import { LoadingOverlay } from "@/components/loading-overlay" // Importez le nouveau composant
import { generateContractPDF } from "@/lib/pdf-generator"
import { Loader2, AlertCircle } from "lucide-react"

// app/sign/[token]/page.js
export default function SignContract({ params }) {
  const router = useRouter()
  const { token } = params
  
  const [currentStep, setCurrentStep] = useState(1)
  const [contractData, setContractData] = useState({
    agreed: false,
    bankingInfo: null,
    signature: null,
    signatureType: null,
    completedAt: null,
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contractId, setContractId] = useState(null)
  const [interpreterName, setInterpreterName] = useState(null)
  const [interpreterEmail, setInterpreterEmail] = useState(null)
  
  // Nouvel état pour le chargement entre les étapes 3 et 4
  const [processingPdf, setProcessingPdf] = useState(false)

  // Validate token on load
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/validate-token?token=${token}`)
        const data = await response.json()
        
        if (!response.ok || !data.valid) {
          setError(data.error || "Invalid or expired link")
          return
        }
        
        setContractId(data.contractId)
        setInterpreterName(data.interpreterName)
        setInterpreterEmail(data.interpreterEmail)
      } catch (error) {
        console.error("Error validating token:", error)
        setError("Failed to validate contract link")
      } finally {
        setLoading(false)
      }
    }
    
    validateToken()
  }, [token])

  const handleStepComplete = async (stepData) => {
    setContractData((prev) => ({ ...prev, ...stepData }))
    
    // Si c'est l'étape de la signature (étape 3), afficher l'overlay de chargement
    if (currentStep === 3) {
      setProcessingPdf(true) // Activer l'overlay de chargement
      
      try {
        // Generate PDF
        const pdfDataUri = await generateContractPDF({
          ...contractData,
          ...stepData,
          bankingInfo: {
            ...contractData.bankingInfo,
            interpreterName,
            email: interpreterEmail,
          }
        }, true)
        
        // Save to database
        await fetch("/api/save-contract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contractId,
            pdfData: pdfDataUri,
            bankingInfo: contractData.bankingInfo,
            signatureData: {
              signature: stepData.signature,
              signatureType: stepData.signatureType,
              completedAt: new Date().toISOString(),
            },
          }),
        })
        
        // Courte pause pour simuler le traitement (peut être supprimée en production)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Passer à l'étape suivante
        setCurrentStep(currentStep + 1)
      } catch (error) {
        console.error("Error saving contract:", error)
        setError("Failed to process your contract. Please try again.")
      } finally {
        setProcessingPdf(false) // Désactiver l'overlay de chargement
      }
    } 
    // Pour les autres étapes, juste passer à l'étape suivante sans overlay
    else if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const steps = [
    { number: 1, title: "Contract Review", description: "Review and agree to terms" },
    { number: 2, title: "Banking Information", description: "Provide payment details" },
    { number: 3, title: "Digital Signature", description: "Sign the contract" },
    { number: 4, title: "Completion", description: "Download your contract" },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Validating contract link...</h2>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Contract Link Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Afficher l'overlay de chargement pendant la génération du PDF */}
      {processingPdf && (
        <LoadingOverlay message="Generating your contract... This may take a few moments." />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-DCMWenTU-lxV54Jwyvarie63VTDWGG4qmL7WUrs.png"
              alt="DBD I&T Logo"
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Electronic Signature System</h1>
            <p className="text-gray-600">
              {interpreterName ? `Welcome, ${interpreterName}` : "Interpreter Service Agreement - Digital Contract Signing"}
            </p>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            {currentStep === 1 && <ContractPreview onComplete={handleStepComplete} />}
            {currentStep === 2 && (
              <BankingInformation 
                onComplete={handleStepComplete} 
                initialData={{ interpreterName, email: interpreterEmail }}
              />
            )}
            {currentStep === 3 && <SignatureCapture onComplete={handleStepComplete} />}
            {currentStep === 4 && (
              <ContractCompletion 
                contractData={{
                  ...contractData,
                  bankingInfo: {
                    ...contractData.bankingInfo,
                    interpreterName,
                    email: interpreterEmail,
                  },
                  contractId
                }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}