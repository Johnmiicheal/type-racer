"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trophy, Medal, Award, RefreshCw } from "lucide-react"
import { memo } from "react"

interface Player {
  id: string
  name: string
  progress: number
  wpm: number
  position: number
  finished: boolean
  color: string
  isBot?: boolean
}

interface RaceResultsModalProps {
  isOpen: boolean
  onClose: () => void
  players: Player[]
  currentPlayerId: string
  onRestart: () => void
}

// Use memo to prevent unnecessary re-renders
const RaceResultsModal = memo(function RaceResultsModal({
  isOpen,
  onClose,
  players,
  currentPlayerId,
  onRestart,
}: RaceResultsModalProps) {
  // Sort players by position
  const sortedPlayers = [...players].sort((a, b) => {
    // First by position if finished
    if (a.finished && b.finished) {
      return a.position - b.position
    }

    // Finished players come first
    if (a.finished && !b.finished) return -1
    if (!a.finished && b.finished) return 1

    // Then by progress
    return b.progress - a.progress
  })

  // Get current player's position
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const currentPlayerPosition = currentPlayer?.position || 0
  const currentPlayerRank = sortedPlayers.findIndex((p) => p.id === currentPlayerId) + 1

  // Get medal icon based on position
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />
      default:
        return <Award className="h-6 w-6 text-blue-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Race Results</DialogTitle>
          <DialogDescription>
            {currentPlayerPosition === 1
              ? "Congratulations! You won the race!"
              : `You finished in position ${currentPlayerRank}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-medium mb-3">Final Standings</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center p-3 rounded-lg ${
                  player.id === currentPlayerId ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8">{getMedalIcon(index + 1)}</div>

                <div className="ml-3 flex-1">
                  <div className="font-medium flex items-center">
                    {player.name}
                    {player.id === currentPlayerId && <span className="text-xs text-blue-600 ml-1">(you)</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {player.finished
                      ? `Finished ${player.position}${getOrdinalSuffix(player.position)}`
                      : "Did not finish"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">{Math.round(player.wpm)} WPM</div>
                  <div className="text-xs text-gray-500">{Math.round(player.progress)}% complete</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onRestart} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

// Helper function to get ordinal suffix
function getOrdinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) {
    return "th"
  }

  switch (n % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

export default RaceResultsModal

