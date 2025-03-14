"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  seconds: number
  onComplete: () => void
}

export default function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-6xl font-bold text-blue-600">{timeLeft}</div>
      <p className="text-xl text-blue-800">Get ready to race!</p>
    </div>
  )
}

