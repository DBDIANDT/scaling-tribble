"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BankingInformationProps {
  onComplete: (data: any) => void
}

export function BankingInformation({ onComplete }: BankingInformationProps) {
  const [formData, setFormData] = useState({
    interpreterName: "",
    address: "",
    phoneNumber: "",
    email: "",
    bankName: "",
    bankAddress: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    accountType: "",
  })
  const [depositConsent, setDepositConsent] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    if (
      depositConsent &&
      Object.values(formData)
        .filter((v) => v !== formData.swiftCode)
        .every((v) => v.trim() !== "")
    ) {
      onComplete({ bankingInfo: formData, depositConsent: true })
    }
  }

  const isFormValid =
    Object.values(formData)
      .filter((v) => v !== formData.swiftCode)
      .every((v) => v.trim() !== "") && depositConsent

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Banking Information</h2>
        <p className="text-gray-600">Please provide your banking details for direct deposit payments</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interpreterName">Full Name *</Label>
                <Input
                  id="interpreterName"
                  value={formData.interpreterName}
                  onChange={(e) => handleInputChange("interpreterName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your complete address"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking Information for Direct Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="Bank of America"
                />
              </div>
              <div>
                <Label htmlFor="accountType">Account Type *</Label>
                <Select onValueChange={(value) => handleInputChange("accountType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="bankAddress">Bank Address *</Label>
              <Input
                id="bankAddress"
                value={formData.bankAddress}
                onChange={(e) => handleInputChange("bankAddress", e.target.value)}
                placeholder="Bank's complete address"
              />
            </div>
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                placeholder="Name as it appears on your account"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  placeholder="Your account number"
                />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number (ABA) *</Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber}
                  onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                  placeholder="9-digit routing number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="swiftCode">SWIFT Code (if applicable)</Label>
              <Input
                id="swiftCode"
                value={formData.swiftCode}
                onChange={(e) => handleInputChange("swiftCode", e.target.value)}
                placeholder="For international transfers"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-800">Direct Deposit Authorization</h3>
              <p className="text-sm text-green-700">
                By providing your banking information, you authorize DBD I&T to deposit your interpreter service
                payments directly into your designated bank account. This authorization will remain in effect until you
                provide written notice to change or cancel it.
              </p>
              <div className="flex items-start space-x-2">
                <Checkbox id="depositConsent" checked={depositConsent} onCheckedChange={setDepositConsent} />
                <label htmlFor="depositConsent" className="text-sm font-medium text-green-800">
                  I hereby authorize DBD I&T to deposit payments directly into my bank account as provided above. I
                  understand that it is my responsibility to ensure that the information provided is correct and to
                  notify the Company of any changes to my banking details.
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleContinue} disabled={!isFormValid} className="px-8">
            Continue to Signature
          </Button>
        </div>
      </div>
    </div>
  )
}
