"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContractPreviewProps {
  onComplete: (data: any) => void
}

export function ContractPreview({ onComplete }: ContractPreviewProps) {
  const [agreed, setAgreed] = useState(false)
  const [rulesAgreed, setRulesAgreed] = useState(false)

  const handleContinue = () => {
    if (agreed && rulesAgreed) {
      onComplete({ agreed: true })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Review</h2>
        <p className="text-gray-600">Please review the interpreter service agreement carefully</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-DCMWenTU-lxV54Jwyvarie63VTDWGG4qmL7WUrs.png"
              alt="DBD I&T"
              className="h-8"
            />
            Interpreter Service Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-md p-4">
            <div className="space-y-4 text-sm">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-4">INTERPRETER SERVICE AGREEMENT</h3>
                <p className="mb-4">
                  This Interpreter Service Agreement ("Agreement") is made and entered into by and between:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border p-4 rounded">
                  <h4 className="font-semibold mb-2">COMPANY:</h4>
                  <p>
                    <strong>DBD I&T</strong>
                  </p>
                  <p>500 GROSSMAN DR</p>
                  <p>BRAINTREE, MA, 02184</p>
                  <p>Phone: 774-508-0492</p>
                </div>
                <div className="border p-4 rounded">
                  <h4 className="font-semibold mb-2">INTERPRETER:</h4>
                  <p>[To be filled during signing]</p>
                </div>
              </div>

              <div className="space-y-4">
                <section>
                  <h4 className="font-semibold mb-2">1. Scope of Services</h4>
                  <p>
                    The Interpreter agrees to provide professional interpretation services for the Company, including
                    on-site interpretation, oral interpretation, written translation, and any other language-related
                    services as required.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">2. Independent Contractor Relationship</h4>
                  <p>
                    The Interpreter acknowledges that they are an independent contractor and not an employee of the
                    Company. The Interpreter shall be responsible for their own taxes, insurance, and other expenses.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">3. Compensation</h4>
                  <p>The Company agrees to pay the Interpreter at the following rates, payable every two weeks:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Portuguese: $35 per hour</li>
                    <li>Spanish: $30 per hour</li>
                    <li>Haitian Creole: $30 per hour</li>
                    <li>Cape Verdean: $30 per hour</li>
                    <li>French: $35 per hour</li>
                    <li>Mandarin: $40 per hour</li>
                    <li>Rare Languages: $45 per hour</li>
                  </ul>
                  <p className="mt-2">
                    Each appointment is scheduled for a minimum of two (2) hours. The Interpreter will be compensated
                    for the full two-hour duration even if the appointment ends earlier.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">4. Scheduling and Cancellations</h4>
                  <p>
                    Interpreters are required to arrive on-site at least fifteen (15) minutes before the scheduled start
                    time. Cancellations require at least forty-eight (48) hours' notice.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">5. Confidentiality</h4>
                  <p>
                    The Interpreter agrees to maintain the confidentiality of all client and company information and not
                    to disclose any proprietary or sensitive information.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">6. Code of Conduct</h4>
                  <p>
                    The Interpreter shall uphold professional ethics, including accuracy, impartiality, and neutrality,
                    and shall not engage in any conduct that may harm the Company's reputation.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">7. Term and Termination</h4>
                  <p>
                    This Agreement continues until terminated by either party with 30 days written notice. The Company
                    may terminate immediately in the event of breach of contract or misconduct.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">8. Governing Law</h4>
                  <p>This Agreement shall be governed by and construed in accordance with the laws of Massachusetts.</p>
                </section>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Agreement Rules & Requirements:</h3>
            <ul className="space-y-2 text-sm">
              <li>• You must provide accurate banking information for direct deposit</li>
              <li>• You agree to maintain professional standards at all times</li>
              <li>• You understand the compensation structure and payment schedule</li>
              <li>• You agree to the confidentiality and code of conduct requirements</li>
              <li>• You acknowledge this is an independent contractor agreement</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="rules" checked={rulesAgreed} onCheckedChange={setRulesAgreed} />
            <label htmlFor="rules" className="text-sm font-medium">
              I have read and understand the agreement rules and requirements
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="agree" checked={agreed} onCheckedChange={setAgreed} />
            <label htmlFor="agree" className="text-sm font-medium">
              I agree to the terms and conditions of this Interpreter Service Agreement
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleContinue} disabled={!agreed || !rulesAgreed} className="px-8">
            Continue to Banking Information
          </Button>
        </div>
      </div>
    </div>
  )
}
