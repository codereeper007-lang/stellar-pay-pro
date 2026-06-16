'use client'
import React, { useState, useEffect } from 'react'

export function ProgressBar({ isVisible }: { isVisible: boolean }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isVisible) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 70) return prev + 15
          if (prev < 95) return prev + 2
          return prev
        })
      }, 200)
    } else {
      setProgress(100)
      const timeout = setTimeout(() => setProgress(0), 400) // reset after fade out
      return () => clearTimeout(timeout)
    }
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-1 z-[100] bg-transparent transition-opacity duration-300 ${isVisible || progress === 100 ? 'opacity-100' : 'opacity-0'}`}
    >
      <div 
        className="h-full bg-gradient-to-r from-[#4338CA] to-[#7C3AED] transition-all ease-out"
        style={{ 
          width: `${progress}%`,
          transitionDuration: isVisible ? '200ms' : '400ms'
        }}
      />
    </div>
  )
}
