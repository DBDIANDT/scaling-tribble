"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignatureCanvas } from "@/components/signature-canvas"

interface SignatureCaptureProps {
  onComplete: (data: any) => void
}

export function SignatureCapture({ onComplete }: SignatureCaptureProps) {
  const [signatureType, setSignatureType] = useState<string>("")
  const [typedSignature, setTypedSignature] = useState("")
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null)
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedSignature(e.target?.result as string)
        setSignatureType("upload")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrawnSignature = (signature: string) => {
    setDrawnSignature(signature)
    setSignatureType("draw")
  }

  const handleTypedSignature = (value: string) => {
    setTypedSignature(value)
    setSignatureType("type")
  }

  const handleContinue = () => {
    let signature = ""
    if (signatureType === "type") signature = typedSignature
    if (signatureType === "upload") signature = uploadedSignature || ""
    if (signatureType === "draw") signature = drawnSignature || ""

    if (signature) {
      onComplete({
        signature,
        signatureType,
        completedAt: new Date().toISOString(),
      })
    }
  }

  const isSignatureComplete = () => {
    if (signatureType === "type") return typedSignature.trim() !== ""
    if (signatureType === "upload") return uploadedSignature !== null
    if (signatureType === "draw") return drawnSignature !== null
    return false
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital Signature</h2>
        <p className="text-gray-600">Please provide your signature using one of the methods below</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Your Signature Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="type" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="type">Type Signature</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="draw">Draw Signature</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typedSignature">Type your full name as your signature</Label>
                <Input
                  id="typedSignature"
                  value={typedSignature}
                  onChange={(e) => handleTypedSignature(e.target.value)}
                  placeholder="Enter your full name"
                  className="text-2xl font-script"
                  style={{ fontFamily: "cursive" }}
                />
              </div>
              {typedSignature && (
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="text-3xl font-script" style={{ fontFamily: "cursive" }}>
                    {typedSignature}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload your signature image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Choose Image File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Supported formats: PNG, JPG, GIF</p>
                </div>
              </div>
              {uploadedSignature && (
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={uploadedSignature || "/placeholder.svg"}
                    alt="Uploaded signature"
                    className="max-h-24 mx-auto"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="draw" className="space-y-4">
              <div className="space-y-2">
                <Label>Draw your signature below</Label>
                <SignatureCanvas onSignature={handleDrawnSignature} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!isSignatureComplete()} className="px-8">
          Complete Contract
        </Button>
      </div>
    </div>
  )
}
