import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Users, Keyboard } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6">Type Racer</h1>
        <p className="text-xl text-blue-600 mb-12">Race against others in this real-time typing challenge!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <Users className="mr-2 h-5 w-5" />
                Multiplayer Race
              </CardTitle>
              <CardDescription>Race with friends in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/create" className="w-full">
                  <Button className="w-full bg-blue-500 hover:bg-blue-500 border-2 border-b-4 border-blue-600 transition-all active:scale-95 hover:border-t-4 hover:border-b-2">Create Race</Button>
                </Link>
                <Link href="/join" className="w-full">
                  <Button className="w-full bg-blue-500 hover:bg-blue-500 border-2 border-b-4 border-blue-600 transition-all active:scale-95 hover:border-t-4 hover:border-b-2">Join Race</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <Bot className="mr-2 h-5 w-5" />
                Computer Opponents
              </CardTitle>
              <CardDescription>Race against AI players</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Challenge computer opponents with different typing speeds.</p>
              <Link href="/computer" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 border-2 border-b-4 border-green-700 hover:border-green-800 hover:border-t-4 hover:border-b-2 transition-all active:scale-95">Play vs Computer</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Link href="/practice">
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 flex items-center">
              <Keyboard className="mr-2 h-4 w-4" />
              Practice Mode
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>Type fast, race faster! Challenge your typing skills in real-time competitions.</p>
        </div>
      </div>
    </div>
  )
}

