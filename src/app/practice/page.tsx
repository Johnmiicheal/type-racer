"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import TypingArea from "@/components/typing-area"

// Sample texts for practice
const practiceTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages.",
  "The Internet is a global system of interconnected computer networks that use the standard Internet protocol suite to link devices worldwide.",
  "Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals.",
  "Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.",
]

export default function PracticePage() {
  const [text, setText] = useState("")
  const [input, setInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  const typingAreaRef = useRef<HTMLInputElement>(null)

  // Initialize with a random text
  useEffect(() => {
    resetPractice()
  }, [])

  // Calculate WPM and accuracy
  useEffect(() => {
    if (startTime && !endTime) {
      const intervalId = setInterval(() => {
        const elapsedMinutes = (Date.now() - startTime) / 60000
        if (elapsedMinutes > 0) {
          // Words are standardized to 5 characters
          const words = currentPosition / 5
          setWpm(Math.round(words / elapsedMinutes))

          // Calculate accuracy
          const totalTyped = input.length
          if (totalTyped > 0) {
            const accuracyValue = 100 - (errors / totalTyped) * 100
            setAccuracy(Math.round(accuracyValue))
          }
        }
      }, 1000)

      return () => clearInterval(intervalId)
    }
  }, [startTime, endTime, currentPosition, errors, input.length])

  const resetPractice = () => {
    const randomText = practiceTexts[Math.floor(Math.random() * practiceTexts.length)]
    setText(randomText)
    setInput("")
    setStartTime(null)
    setEndTime(null)
    setCurrentPosition(0)
    setErrors(0)
    setWpm(0)
    setAccuracy(100)

    // Focus the typing area
    setTimeout(() => {
      if (typingAreaRef.current) {
        typingAreaRef.current.focus()
      }
    }, 100)
  }

  const handleTyping = (newInput: string) => {
    // Start the timer on first keystroke
    if (!startTime && newInput.length > 0) {
      setStartTime(Date.now())
    }

    setInput(newInput)

    // Calculate current position and errors
    let correctPosition = 0
    let errorCount = 0

    for (let i = 0; i < newInput.length; i++) {
      if (i >= text.length) break

      if (newInput[i] === text[i]) {
        correctPosition = i + 1
      } else {
        errorCount++
      }
    }

    setCurrentPosition(correctPosition)
    setErrors(errorCount)

    // Check if finished
    if (correctPosition === text.length && newInput.length === text.length) {
      setEndTime(Date.now())
    }
  }

  // Calculate progress percentage
  const progress = text ? (currentPosition / text.length) * 100 : 0

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-3xl w-full">
        <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-blue-800 mb-6">Practice Mode</h1>

        <Card className="shadow-lg p-6 mb-6">
          <TypingArea
            text={text}
            currentPosition={currentPosition}
            input={input}
            onInputChange={handleTyping}
            disabled={!!endTime}
            ref={typingAreaRef}
          />
        </Card>

        <Card className="shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-xl font-bold">{Math.round(progress)}%</p>
              <Progress value={progress} className="mt-1" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Speed</p>
              <p className="text-xl font-bold">{wpm} WPM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Accuracy</p>
              <p className="text-xl font-bold">{accuracy}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="text-xl font-bold">
                {startTime && (endTime || Date.now())
                  ? `${(((endTime || Date.now()) - startTime) / 1000).toFixed(1)}s`
                  : "0.0s"}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button onClick={resetPractice} className="flex items-center bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Text
          </Button>
        </div>
      </div>
    </div>
  )
}

