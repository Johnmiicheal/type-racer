// app/join/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/lib/SocketContext"; // Import the socket context

export default function JoinRace() {
  const router = useRouter();
  const { connectSocket, socket } = useSocket(); // Get connectSocket and socket from context
  const [raceCode, setRaceCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const handleJoinRace = () => {
    if (!raceCode.trim()) {
      setError("Please enter a race code");
      return;
    }

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    // Connect to the socket with the race details
    connectSocket(raceCode, playerName);

    // Emit a joinRace event to check if the race exists
    socket?.emit("joinRace", { raceId: raceCode, playerName });

    // Navigate directly to the race page after attempting to join
    router.push(`/race/${raceCode}?name=${encodeURIComponent(playerName)}`);
  };

  // Set up event listeners when component mounts
  useState(() => {
    if (socket) {
      socket.on("error", (err: string) => {
        setError(err || "Invalid race code or race has already started");
      });
    }
    
    return () => {
      // Clean up event listeners
      if (socket) {
        socket.off("error");
      }
    };
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Join a Race</CardTitle>
            <CardDescription>Enter a race code to join an existing race</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="raceCode">Race Code</Label>
                <Input
                  id="raceCode"
                  placeholder="Enter race code"
                  value={raceCode}
                  onChange={(e) => {
                    setRaceCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  className="font-mono text-lg tracking-wider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full bg-blue-500 hover:bg-blue-500 border-2 border-b-4 border-blue-600 transition-all active:scale-95 hover:border-t-4 hover:border-b-2" onClick={handleJoinRace}>
              Join Race
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}