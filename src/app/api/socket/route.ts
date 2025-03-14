import { Server } from "socket.io"
import { NextResponse } from "next/server"

// Sample texts for races
const raceTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages.",
  "The Internet is a global system of interconnected computer networks that use the standard Internet protocol suite to link devices worldwide.",
  "Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals.",
  "Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.",
]

// Player colors
const playerColors = [
  "#3498db", // blue
  "#e74c3c", // red
  "#2ecc71", // green
  "#f39c12", // orange
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#d35400", // dark orange
  "#34495e", // navy
]

// Bot names
const botNames = [
  "TypeBot",
  "SpeedTyper",
  "KeyMaster",
  "WordWizard",
  "RapidKeys",
  "SwiftFingers",
  "TypePro",
  "KeyboardKing",
  "QuickType",
  "FlashKeys",
  "TurboTyper",
  "NinjaKeys",
]

// Store active races
const races = new Map()

// Socket.IO server instance
let io

// Computer player simulation
class ComputerPlayer {
  id: string
  name: string
  progress = 0
  wpm = 0
  accuracy = 100
  position = 0
  finished = false
  color: string
  isBot = true

  // Bot typing characteristics
  private minWPM: number
  private maxWPM: number
  private errorRate: number
  private consistencyFactor: number
  private textLength: number
  private startTime: number | null = null
  private updateInterval: NodeJS.Timeout | null = null

  constructor(id: string, name: string, color: string, difficulty: string, textLength: number) {
    this.id = id
    this.name = name
    this.color = color
    this.textLength = textLength

    // Set typing characteristics based on difficulty
    switch (difficulty) {
      case "easy":
        this.minWPM = 20
        this.maxWPM = 40
        this.errorRate = 0.05
        this.consistencyFactor = 0.7
        break
      case "medium":
        this.minWPM = 40
        this.maxWPM = 70
        this.errorRate = 0.03
        this.consistencyFactor = 0.8
        break
      case "hard":
        this.minWPM = 70
        this.maxWPM = 100
        this.errorRate = 0.01
        this.consistencyFactor = 0.9
        break
      default:
        // Random difficulty
        this.minWPM = 30 + Math.floor(Math.random() * 50)
        this.maxWPM = this.minWPM + 20 + Math.floor(Math.random() * 30)
        this.errorRate = 0.01 + Math.random() * 0.05
        this.consistencyFactor = 0.7 + Math.random() * 0.3
    }

    // Set initial WPM within range
    this.wpm = this.minWPM + Math.random() * (this.maxWPM - this.minWPM)
  }

  startTyping(raceId: string) {
    this.startTime = Date.now()

    // Update progress at regular intervals
    this.updateInterval = setInterval(() => {
      if (!this.startTime || this.finished) return

      // Calculate elapsed time in minutes
      const elapsedMinutes = (Date.now() - this.startTime) / 60000

      // Vary typing speed slightly over time for realism
      const speedVariation = Math.sin(Date.now() / 5000) * (1 - this.consistencyFactor) * 10
      const currentWPM = Math.max(this.minWPM, Math.min(this.maxWPM, this.wpm + speedVariation))

      // Calculate characters typed based on WPM (assuming 5 chars per word)
      const charsTyped = currentWPM * 5 * elapsedMinutes

      // Calculate progress percentage
      this.progress = Math.min(100, (charsTyped / this.textLength) * 100)

      // Update WPM
      this.wpm = currentWPM

      // Occasionally make errors
      if (Math.random() < this.errorRate) {
        this.accuracy = Math.max(80, this.accuracy - Math.random() * 2)
      }

      // Check if finished
      if (this.progress >= 100) {
        this.progress = 100
        this.finished = true
        clearInterval(this.updateInterval)

        // Notify race that bot finished
        if (races.has(raceId)) {
          const race = races.get(raceId)

          // Count finished players to determine position
          const finishedPlayers = race.players.filter((p) => p.finished)
          this.position = finishedPlayers.length + 1

          // Update race state
          io.to(raceId).emit("gameState", race)

          // Check if all players finished
          if (race.players.every((p) => p.finished)) {
            race.status = "finished"
            race.endTime = Date.now()
            io.to(raceId).emit("gameState", race)
          }
        }
      }

      // Emit updated game state
      if (races.has(raceId)) {
        io.to(raceId).emit("gameState", races.get(raceId))
      }
    }, 200) // Update every 200ms for smooth progress
  }

  stopTyping() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  }
}

export async function GET(req) {
  if (!io) {
    // Create a new Socket.IO server if one doesn't exist
    const res = new NextResponse()

    io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    // Handle socket connections
    io.on("connection", (socket) => {
      console.log("New connection:", socket.id)

      // Get race ID and player name from query
      const { raceId, playerName, isComputerMode, numBots, difficulty } = socket.handshake.query

      if (!raceId) {
        socket.emit("error", "Race ID is required")
        socket.disconnect()
        return
      }

      // Join race room
      socket.join(raceId)

      // Create race if it doesn't exist
      if (!races.has(raceId)) {
        const raceText = raceTexts[Math.floor(Math.random() * raceTexts.length)]

        races.set(raceId, {
          id: raceId,
          status: "waiting",
          players: [],
          text: raceText,
          startTime: null,
          endTime: null,
          isComputerMode: isComputerMode === "true",
          computerPlayers: [],
        })

        // Add computer players if in computer mode
        if (isComputerMode === "true") {
          const race = races.get(raceId)
          const botCount = Number.parseInt(numBots, 10)

          // Create bot players with different names and colors
          for (let i = 0; i < botCount; i++) {
            const botName = botNames[Math.floor(Math.random() * botNames.length)] + (i + 1)
            const botColor = playerColors[(i + 1) % playerColors.length]
            const botId = `bot-${raceId}-${i}`

            // Create computer player with appropriate difficulty
            const botDifficulty =
              difficulty === "mixed" ? ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] : difficulty

            const computerPlayer = new ComputerPlayer(botId, botName, botColor, botDifficulty, race.text.length)

            race.players.push(computerPlayer)
            race.computerPlayers.push(computerPlayer)
          }
        }
      }

      const race = races.get(raceId)

      // Add player to race
      const playerColor = playerColors[race.players.length % playerColors.length]

      const player = {
        id: socket.id,
        name: playerName || "Anonymous",
        progress: 0,
        wpm: 0,
        accuracy: 100,
        position: 0,
        finished: false,
        color: playerColor,
        isBot: false,
      }

      race.players.push(player)

      // Send current game state to all players in the race
      io.to(raceId).emit("gameState", race)

      // Handle player disconnect
      socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id)

        // Remove player from race
        if (races.has(raceId)) {
          const race = races.get(raceId)
          race.players = race.players.filter((p) => p.id !== socket.id)

          // Delete race if no players left
          if (race.players.length === 0) {
            // Stop all computer players
            if (race.computerPlayers) {
              race.computerPlayers.forEach((bot) => bot.stopTyping())
            }
            races.delete(raceId)
          } else {
            // Update game state
            io.to(raceId).emit("gameState", race)
          }
        }
      })

      // Handle start race
      socket.on("startRace", () => {
        if (races.has(raceId)) {
          const race = races.get(raceId)

          // Start countdown
          race.status = "countdown"
          io.to(raceId).emit("gameState", race)

          // Start race after countdown
          setTimeout(() => {
            race.status = "racing"
            race.startTime = Date.now()

            // Start computer players typing
            if (race.computerPlayers && race.computerPlayers.length > 0) {
              race.computerPlayers.forEach((bot) => bot.startTyping(raceId))
            }

            io.to(raceId).emit("gameState", race)
          }, 5000) // 5 second countdown
        }
      })

      // Handle player progress updates
      socket.on("updateProgress", ({ progress, position, errors }) => {
        if (races.has(raceId)) {
          const race = races.get(raceId)
          const player = race.players.find((p) => p.id === socket.id)

          if (player && race.status === "racing") {
            player.progress = progress

            // Calculate WPM
            if (race.startTime) {
              const elapsedMinutes = (Date.now() - race.startTime) / 60000
              if (elapsedMinutes > 0) {
                // Words are standardized to 5 characters
                const words = position / 5
                player.wpm = words / elapsedMinutes
              }
            }

            // Calculate accuracy
            const totalTyped = position + errors
            if (totalTyped > 0) {
              player.accuracy = 100 - (errors / totalTyped) * 100
            }

            // Update game state
            io.to(raceId).emit("gameState", race)
          }
        }
      })

      // Handle player finished
      socket.on("playerFinished", () => {
        if (races.has(raceId)) {
          const race = races.get(raceId)
          const player = race.players.find((p) => p.id === socket.id)

          if (player && race.status === "racing" && !player.finished) {
            player.finished = true

            // Assign position
            const finishedPlayers = race.players.filter((p) => p.finished)
            player.position = finishedPlayers.length

            // Check if all players finished
            if (finishedPlayers.length === race.players.length) {
              race.status = "finished"
              race.endTime = Date.now()

              // Stop all computer players
              if (race.computerPlayers) {
                race.computerPlayers.forEach((bot) => bot.stopTyping())
              }
            }

            // Update game state
            io.to(raceId).emit("gameState", race)
          }
        }
      })
    })

    // Clean up inactive races periodically
    setInterval(
      () => {
        const now = Date.now()

        races.forEach((race, raceId) => {
          // Remove races that have been finished for more than 10 minutes
          if (race.status === "finished" && race.endTime && now - race.endTime > 10 * 60 * 1000) {
            // Stop all computer players
            if (race.computerPlayers) {
              race.computerPlayers.forEach((bot) => bot.stopTyping())
            }
            races.delete(raceId)
          }

          // Remove races that have been waiting for more than 30 minutes
          if (race.status === "waiting" && race.players.length === 0) {
            races.delete(raceId)
          }
        })
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes
  }

  // Upgrade the HTTP connection to a WebSocket connection
  io.attachWebSocketServer(req, new NextResponse())

  return new NextResponse("Socket.IO server running")
}

