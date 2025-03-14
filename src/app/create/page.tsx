// app/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/lib/SocketContext"; // Import the socket context

export default function CreateRace() {
  const router = useRouter();
  const { connectSocket } = useSocket(); // Get connectSocket from context
  const [raceCreated, setRaceCreated] = useState(false);
  const [raceCode, setRaceCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRace = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    // Generate a random race code
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRaceCode(generatedCode);
    setRaceCreated(true);

    // Connect to the socket with the race details
    connectSocket(generatedCode, playerName, true, 0, difficulty); // Assuming 3 bots for now
  };

  const handleStartRace = () => {
    if (playerName.trim() && raceCode) {
      router.push(`/race/${raceCode}?name=${encodeURIComponent(playerName)}`);
    }
  };

  const copyRaceCode = () => { 
    navigator.clipboard.writeText(raceCode);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{raceCreated ? "Race Created" : "Create a Race"}</CardTitle>
            <CardDescription>
              {raceCreated ? "Share this code with friends to join your race" : "Set up your race preferences"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!raceCreated ? (
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
                  <Label>Difficulty</Label>
                  <RadioGroup value={difficulty} onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard">Hard</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="public-race" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="public-race">Public Race</Label>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="raceCode">Race Code</Label>
                  <div className="flex">
                    <Input id="raceCode" value={raceCode} readOnly className="font-mono text-lg tracking-wider" />
                    <Button variant="outline" size="icon" className="ml-2" onClick={copyRaceCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waitingPlayers">Waiting for Players</Label>
                  <div className="border rounded-md p-3 bg-blue-50">
                    <p className="text-sm text-blue-600">
                      Share the race code with friends. The race will begin when you start it.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {!raceCreated ? (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateRace}
                disabled={!playerName.trim()}
              >
                Create Race
              </Button>
            ) : (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleStartRace}>
                Start Race
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}