'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Test Page Works!</h1>
      <p className="mt-4">If you can see this, the app is working correctly.</p>
    </div>
  )
}
