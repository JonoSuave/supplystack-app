'use client'

import { useState } from 'react'
import { crawlAndStoreMaterials } from '@/app/actions/firecrawl'

export default function CrawlButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    count?: number
  } | null>(null)

  const handleCrawl = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const crawlResult = await crawlAndStoreMaterials()
      setResult(crawlResult)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={handleCrawl}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Crawling...
          </>
        ) : (
          'Crawl for Materials'
        )}
      </button>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium">{result.message}</p>
          {result.success && result.count && (
            <p className="text-sm mt-1">Added {result.count} materials to the database.</p>
          )}
        </div>
      )}
    </div>
  )
}
