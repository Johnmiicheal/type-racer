"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Bot } from "lucide-react"
import Link from "next/link"

export default function ComputerRacePage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [computerPlayers, setComputerPlayers] = useState(3)
  const [difficulty, setDifficulty] = useState("medium")

  const handleStartRace = () => {
    if (!playerName.trim()) return

    // Generate a random race code for the computer race
    const raceCode = `CPU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Navigate to the race page with query parameters
    router.push(
      `/race/${raceCode}?name=${encodeURIComponent(playerName)}&mode=computer&bots=${computerPlayers}&difficulty=${difficulty}`,
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Play Against Computer</CardTitle>
            <CardDescription>Race against computer opponents with different typing speeds</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Computer Opponents</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[computerPlayers]}
                    onValueChange={(value) => setComputerPlayers(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center font-medium">{computerPlayers}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">1</span>
                  <span className="text-xs text-gray-500">5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="flex items-center">
                      Easy <span className="ml-2 text-xs text-gray-500">(20-40 WPM)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="flex items-center">
                      Medium <span className="ml-2 text-xs text-gray-500">(40-70 WPM)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="flex items-center">
                      Hard <span className="ml-2 text-xs text-gray-500">(70-100 WPM)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="flex items-center">
                      Mixed <span className="ml-2 text-xs text-gray-500">(variety of speeds)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-500 border-2 border-b-4 border-blue-600 transition-all active:scale-95 hover:border-t-4 hover:border-b-2"
              onClick={handleStartRace}
              disabled={!playerName.trim()}
            >
              Start Race
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Bot className="mr-2 h-5 w-5 text-blue-600" />
            Computer Players
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Computer players simulate real typing with different speeds and occasional errors:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Easy: Casual typists (20-40 WPM)</li>
            <li>• Medium: Average typists (40-70 WPM)</li>
            <li>• Hard: Professional typists (70-100 WPM)</li>
            <li>• Mixed: A combination of different skill levels</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

