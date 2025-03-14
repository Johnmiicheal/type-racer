"use client"

import { forwardRef, useEffect, useRef } from "react"
import { memo } from "react"
import { Input } from "@/components/ui/input"

interface TypingAreaProps {
  text: string
  currentPosition: number
  input: string
  onInputChange: (input: string) => void
  disabled?: boolean
}

// Use memo with forwardRef to prevent unnecessary re-renders
const TypingArea = memo(
  forwardRef<HTMLInputElement, TypingAreaProps>(
    ({ text, currentPosition, input, onInputChange, disabled = false }, ref) => {
      const textDisplayRef = useRef<HTMLDivElement>(null)

      // Scroll text display to keep current position visible
      useEffect(() => {
        if (textDisplayRef.current) {
          const textDisplay = textDisplayRef.current
          const currentChar = textDisplay.querySelector(".current")

          if (currentChar) {
            const containerRect = textDisplay.getBoundingClientRect()
            const charRect = currentChar.getBoundingClientRect()

            // If current character is out of view, scroll to it
            if (charRect.right > containerRect.right || charRect.left < containerRect.left) {
              textDisplay.scrollLeft = charRect.left - containerRect.left - 100
            }
          }
        }
      }, [currentPosition])

      // Render text with highlighting for typed characters
      const renderText = () => {
        if (!text) return null

        return text.split("").map((char, index) => {
          let className = ""

          if (index < currentPosition) {
            // Correctly typed character
            className = "text-green-600"
          } else if (index === currentPosition) {
            // Current position
            className = "current bg-blue-200 text-blue-800"
          } else {
            // Not yet typed
            className = "text-gray-800"
          }

          // Handle spaces
          if (char === " ") {
            return (
              <span key={index} className={className}>
                &nbsp;
              </span>
            )
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          )
        })
      }

      return (
        <div className="space-y-4">
          <div
            ref={textDisplayRef}
            className="p-4 bg-gray-50 rounded-lg border text-lg leading-relaxed break-words"
            style={{ minHeight: "100px" }}
          >
            {renderText()}
          </div>

          <Input
            ref={ref}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Start typing..."
            className="text-lg p-4"
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      )
    },
  ),
)

TypingArea.displayName = "TypingArea"

export default TypingArea

