"use client"

import { Loader2 } from "lucide-react"

export function LoadingOverlay({ message = "Processing your contract..." }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Please wait</h3>
          <p className="text-gray-600 text-center">{message}</p>
        </div>
      </div>
    </div>
  )
}