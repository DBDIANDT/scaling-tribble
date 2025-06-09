"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFPreviewProps {
  htmlContent: string
}

export function PDFPreview({ htmlContent }: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5) // Updated to 5 pages
  const [zoom, setZoom] = useState(0.8)
  const [pdfDataUri, setPdfDataUri] = useState<string>("")

  useEffect(() => {
    // The htmlContent is now a PDF data URI from jsPDF
    setPdfDataUri(htmlContent)
  }, [htmlContent])

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3))
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[600px] overflow-auto bg-gray-200 p-4 flex justify-center">
        {pdfDataUri ? (
          <iframe
            src={pdfDataUri}
            className="bg-white shadow-lg border"
            style={{
              width: `${210 * zoom * 3}px`,
              height: `${297 * zoom * 3}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
            title="PDF Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading PDF preview...</p>
          </div>
        )}
      </div>
    </Card>
  )
}
