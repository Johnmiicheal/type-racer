import { Bot, User } from "lucide-react"

export default function Leaderboard({
  players,
  currentPlayerId,
}: {
  players: Array<{
    id: string
    name: string
    progress: number
    wpm: number
    position: number
    finished: boolean
    isBot?: boolean
  }>
  currentPlayerId: string
}) {
  // Sort players by progress (descending)
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center p-2 rounded-lg ${
              player.id === currentPlayerId ? "bg-blue-50 border border-blue-200" : ""
            }`}
          >
            <div className="w-6 text-center font-bold">{index + 1}</div>

            <div className="ml-2 flex-1 truncate flex items-center">
              {player.isBot ? (
                <Bot className="mr-1 h-3 w-3 text-gray-500" />
              ) : (
                <User className="mr-1 h-3 w-3 text-gray-500" />
              )}
              {player.name}
              {player.id === currentPlayerId && <span className="text-xs text-blue-600 ml-1">(you)</span>}
            </div>

            <div className="text-right">
              <div className="font-medium">
                {player.finished
                  ? `Finished ${player.position}${getOrdinalSuffix(player.position)}`
                  : `${Math.round(player.progress)}%`}
              </div>
              <div className="text-xs text-gray-500">{Math.round(player.wpm)} WPM</div>
            </div>
          </div>
        ))}

        {players.length === 0 && <div className="text-center text-gray-500 py-4">No players yet</div>}
      </div>
    </div>
  )
}

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

