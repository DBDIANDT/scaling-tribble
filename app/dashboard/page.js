"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Download, 
  Send, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  AlertCircle 
} from "lucide-react"

// app/dashboard/page.js
export default function Dashboard() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewContractForm, setShowNewContractForm] = useState(false)
  const [formData, setFormData] = useState({
    interpreterName: "",
    interpreterEmail: "",
  })
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch contracts on load
  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/contracts")
      const data = await response.json()
      setContracts(data.contracts || [])
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      if (response.ok) {
        setFormData({
          interpreterName: "",
          interpreterEmail: "",
        })
        setShowNewContractForm(false)
        fetchContracts()
      } else {
        alert("Error: " + (data.error || "Failed to create contract"))
      }
    } catch (error) {
      console.error("Error creating contract:", error)
      alert("Failed to create contract. Please try again.")
    } finally {
      setSending(false)
    }
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString()
  }
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />
      case "signed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expired":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }
  
  // Filter contracts based on search term
  const filteredContracts = contracts.filter(
    (contract) =>
      contract.interpreter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.interpreter_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Download signed contract
  const downloadContract = async (contractId) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`)
      const data = await response.json()
      
      if (response.ok && data.pdfData) {
        // Create and trigger download
        const link = document.createElement("a")
        link.href = data.pdfData
        link.download = `Contract_${contractId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert("Contract PDF not found")
      }
    } catch (error) {
      console.error("Error downloading contract:", error)
      alert("Failed to download contract")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
              <p className="text-gray-600">Manage interpreter service agreements</p>
            </div>
            <Button 
              onClick={() => setShowNewContractForm(!showNewContractForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </div>

          {showNewContractForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Send New Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interpreterName">Interpreter Name</Label>
                      <Input
                        id="interpreterName"
                        name="interpreterName"
                        value={formData.interpreterName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="interpreterEmail">Interpreter Email</Label>
                      <Input
                        id="interpreterEmail"
                        name="interpreterEmail"
                        type="email"
                        value={formData.interpreterEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowNewContractForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={sending}>
                      {sending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Contract
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contracts</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search contracts..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchContracts}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p>Loading contracts...</p>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No contracts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Interpreter</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Signed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(contract.status)}
                              <span className="capitalize">{contract.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>{contract.interpreter_name}</TableCell>
                          <TableCell>{contract.interpreter_email}</TableCell>
                          <TableCell>{formatDate(contract.created_at)}</TableCell>
                          <TableCell>{formatDate(contract.sent_at)}</TableCell>
                          <TableCell>{formatDate(contract.signed_at)}</TableCell>
                          <TableCell className="text-right">
                            {contract.status === "signed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadContract(contract.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            ) : contract.status === "sent" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Re-send email functionality would go here
                                  alert("This would re-send the contract email")
                                }}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Resend
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}