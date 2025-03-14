"use client"

import { useEffect, useRef } from "react"
import { memo } from "react"

interface Player {
  id: string
  name: string
  progress: number
  color: string
  isBot?: boolean
}

interface RaceTrackProps {
  players: Player[]
  currentPlayerId: string
}

// Use memo to prevent unnecessary re-renders
const RaceTrack = memo(function RaceTrack({ players, currentPlayerId }: RaceTrackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw the race track and cars
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw track
    const trackY = rect.height / 2
    const trackWidth = rect.width - 100
    const laneHeight = 40
    const startX = 50
    const finishX = startX + trackWidth

    // Draw finish line
    ctx.fillStyle = "#000"
    ctx.fillRect(finishX, trackY - (players.length * laneHeight) / 2, 5, players.length * laneHeight)

    // Draw checkered pattern on finish line
    const squareSize = 5
    ctx.fillStyle = "#fff"
    for (let i = 0; i < players.length * laneHeight; i += squareSize * 2) {
      for (let j = 0; j < 5; j += squareSize * 2) {
        ctx.fillRect(finishX + j, trackY - (players.length * laneHeight) / 2 + i, squareSize, squareSize)
        ctx.fillRect(
          finishX + j + squareSize,
          trackY - (players.length * laneHeight) / 2 + i + squareSize,
          squareSize,
          squareSize,
        )
      }
    }

    // Draw lanes
    players.forEach((player, index) => {
      const laneY = trackY - (players.length * laneHeight) / 2 + index * laneHeight

      // Draw lane
      ctx.fillStyle = index % 2 === 0 ? "#f0f0f0" : "#e0e0e0"
      ctx.fillRect(startX, laneY, trackWidth, laneHeight)

      // Draw lane divider
      ctx.strokeStyle = "#ccc"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(startX, laneY + laneHeight)
      ctx.lineTo(finishX, laneY + laneHeight)
      ctx.stroke()

      // Draw player name
      ctx.fillStyle = "#333"
      ctx.font = "12px sans-serif"
      ctx.fillText(player.name, startX, laneY + 20)

      // Draw car
      const carX = startX + (trackWidth * player.progress) / 100
      drawCar(ctx, carX, laneY + laneHeight / 2, player.color, player.id === currentPlayerId)
    })

    // Draw start line
    ctx.fillStyle = "#000"
    ctx.fillRect(startX, trackY - (players.length * laneHeight) / 2, 2, players.length * laneHeight)
  }, [players, currentPlayerId])

  // Draw a car
  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isCurrentPlayer: boolean) => {
    const carWidth = 30
    const carHeight = 15

    // Car body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(x - carWidth / 2, y - carHeight / 2, carWidth, carHeight, 5)
    ctx.fill()

    // Windshield
    ctx.fillStyle = "#a0d8ef"
    ctx.beginPath()
    ctx.roundRect(x - 5, y - carHeight / 2 + 2, 10, 5, 2)
    ctx.fill()

    // Wheels
    ctx.fillStyle = "#333"
    ctx.beginPath()
    ctx.arc(x - carWidth / 3, y + carHeight / 2, 3, 0, Math.PI * 2)
    ctx.arc(x + carWidth / 3, y + carHeight / 2, 3, 0, Math.PI * 2)
    ctx.fill()

    // Highlight current player's car
    if (isCurrentPlayer) {
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(x - carWidth / 2 - 2, y - carHeight / 2 - 2, carWidth + 4, carHeight + 4, 6)
      ctx.stroke()
    }
  }

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
})

export default RaceTrack

