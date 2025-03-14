/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
// app/race/[id]/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import RaceTrack from "@/components/race-track";
import TypingArea from "@/components/typing-area";
import Leaderboard from "@/components/leaderboard";
import CountdownTimer from "@/components/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";
import RaceResultsModal from "@/components/race-results-modal";
import { useSocket } from "@/lib/SocketContext";

// Types
interface Player {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  position: number;
  finished: boolean;
  color: string;
  isBot?: boolean;
}

interface GameState {
  status: "waiting" | "countdown" | "racing" | "finished";
  players: Player[];
  text: string;
  startTime: number | null;
  endTime: number | null;
  isComputerMode?: boolean;
  computerPlayers?: Player[];
}

// Constants
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task.",
  "The Internet is a global system of interconnected computer networks that use the standard Internet protocol suite."
];

const botNames = [
  "TypeBot", "SpeedTyper", "KeyMaster", "WordWizard",
  "RapidKeys", "SwiftFingers", "TypePro", "KeyboardKing",
  "QuickType", "FlashKeys", "TurboTyper", "NinjaKeys",
];

const playerColors = [
  "#3498db", "#e74c3c", "#2ecc71", "#f39c12",
  "#9b59b6", "#1abc9c", "#d35400", "#34495e",
];

// Computer player simulation (client-side)
class ComputerPlayer {
  id: string;
  name: string;
  progress = 0;
  wpm = 0;
  accuracy = 100;
  position = 0;
  finished = false;
  color: string;
  isBot = true;

  private minWPM: number;
  private maxWPM: number;
  private errorRate: number;
  private consistencyFactor: number;
  private textLength: number;
  private startTime: number | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(id: string, name: string, color: string, difficulty: string, textLength: number) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.textLength = textLength;

    switch (difficulty) {
      case "easy":
        this.minWPM = 20;
        this.maxWPM = 40;
        this.errorRate = 0.05;
        this.consistencyFactor = 0.7;
        break;
      case "medium":
        this.minWPM = 40;
        this.maxWPM = 70;
        this.errorRate = 0.03;
        this.consistencyFactor = 0.8;
        break;
      case "hard":
        this.minWPM = 70;
        this.maxWPM = 100;
        this.errorRate = 0.01;
        this.consistencyFactor = 0.9;
        break;
      default:
        this.minWPM = 30 + Math.floor(Math.random() * 50);
        this.maxWPM = this.minWPM + 20 + Math.floor(Math.random() * 30);
        this.errorRate = 0.01 + Math.random() * 0.05;
        this.consistencyFactor = 0.7 + Math.random() * 0.3;
    }

    this.wpm = this.minWPM + Math.random() * (this.maxWPM - this.minWPM);
  }

  startTyping(onUpdate: (bot: ComputerPlayer) => void) {
    this.startTime = Date.now();
    this.updateInterval = setInterval(() => {
      if (!this.startTime || this.finished) return;

      const elapsedMinutes = (Date.now() - this.startTime) / 60000;
      const speedVariation = Math.sin(Date.now() / 5000) * (1 - this.consistencyFactor) * 10;
      const currentWPM = Math.max(this.minWPM, Math.min(this.maxWPM, this.wpm + speedVariation));
      const charsTyped = currentWPM * 5 * elapsedMinutes;

      this.progress = Math.min(100, (charsTyped / this.textLength) * 100);
      this.wpm = currentWPM;

      if (Math.random() < this.errorRate) {
        this.accuracy = Math.max(80, this.accuracy - Math.random() * 2);
      }

      onUpdate(this);

      if (this.progress >= 100) {
        this.progress = 100;
        this.finished = true;
        onUpdate(this);
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
          this.updateInterval = null;
        }
      }
    }, 200);
  }

  stopTyping() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export default function RacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const raceId = params.id as string;
  const playerName = searchParams.get("name") || "Anonymous";
  const isComputerMode = searchParams.get("mode") === "computer";
  const numBots = Number.parseInt(searchParams.get("bots") || "3", 10);
  const difficulty = searchParams.get("difficulty") || "medium";

  const { socket, gameState, connectSocket, startRace: startSocketRace, updateProgress, playerFinished } = useSocket();
  const [localGameState, setLocalGameState] = useState<GameState>({
    status: "waiting",
    players: [],
    text: "",
    startTime: null,
    endTime: null,
  });
  const [currentInput, setCurrentInput] = useState("");
  const [currentPosition, setCurrentPosition] = useState(0);
  const [errors, setErrors] = useState(0);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [computerPlayers, setComputerPlayers] = useState<ComputerPlayer[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const typingAreaRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Memoize initializeComputerPlayers
  const initializeComputerPlayers = useCallback(
    (text: string) => {
      const bots: ComputerPlayer[] = [];
      for (let i = 0; i < numBots; i++) {
        const botName = botNames[Math.floor(Math.random() * botNames.length)] + (i + 1);
        const botColor = playerColors[(i + 1) % playerColors.length];
        const botId = `bot-${raceId}-${i}`;
        const botDifficulty = difficulty === "mixed" ? ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] : difficulty;

        const computerPlayer = new ComputerPlayer(botId, botName, botColor, botDifficulty, text.length);
        bots.push(computerPlayer);
      }
      return bots;
    },
    [numBots, difficulty, raceId]
  );

  // Memoize handleBotUpdate
  const handleBotUpdate = useCallback(
    (updatedBot: ComputerPlayer) => {
      setLocalGameState((prevState) => {
        const updatedPlayers = prevState.players.map((player) =>
          player.id === updatedBot.id ? { ...updatedBot } : player
        );

        if (updatedBot.finished) {
          const finishedPlayers = updatedPlayers.filter((p) => p.finished);
          finishedPlayers.forEach((p, idx) => {
            if (!p.position) p.position = idx + 1;
          });
        }

        const allFinished = updatedPlayers.every((p) => p.finished);
        let newStatus = prevState.status;
        let newEndTime = prevState.endTime;

        if (allFinished && prevState.status === "racing") {
          newStatus = "finished";
          newEndTime = Date.now();
          const winner = updatedPlayers.find((p) => p.position === 1);
          if (winner) {
            setTimeout(() => {
              toast({
                title: `${winner.name} wins!`,
                description: `With a speed of ${Math.round(winner.wpm)} WPM`,
              });
            }, 0);
          }
        }

        return {
          ...prevState,
          players: updatedPlayers,
          status: newStatus,
          endTime: newEndTime,
        };
      });
    },
    [toast]
  );

  // Initialize game mode (runs once on mount)
  useEffect(() => {
    if (isComputerMode) {
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      const localPlayerId = `player-${Date.now()}`;
      setPlayerId(localPlayerId);

      const initialState: GameState = {
        status: "waiting",
        players: [
          {
            id: localPlayerId,
            name: playerName,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            position: 0,
            finished: false,
            color: playerColors[0],
            isBot: false,
          },
        ],
        text: randomText,
        startTime: null,
        endTime: null,
      };

      const bots = initializeComputerPlayers(randomText);
      initialState.players = [...initialState.players, ...bots];
      setLocalGameState(initialState);
      setComputerPlayers(bots);
    } else {
      connectSocket(raceId, playerName, false); // Connect only once
    }

    // No cleanup needed here since socket cleanup is handled in SocketContext
  }, [isComputerMode, raceId, playerName, connectSocket, initializeComputerPlayers]); // Stable dependencies

  // Set playerId for multiplayer mode (runs when socket connects)
  useEffect(() => {
    if (!isComputerMode && socket && !playerId) {
      const handleConnect = () => {
        setPlayerId(socket?.id!);
      };
      socket.on("connect", handleConnect);

      return () => {
        socket.off("connect", handleConnect);
      };
    }
  }, [socket, isComputerMode, playerId]); // Add playerId to prevent re-running after set

  // Show results modal when race finishes
  useEffect(() => {
    const state = isComputerMode ? localGameState : gameState;
    if (state?.status === "finished" && !showResultsModal) {
      const timer = setTimeout(() => {
        setShowResultsModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComputerMode, localGameState, gameState, showResultsModal]); // Use full objects as dependencies

  // Handle typing input
  const handleTyping = (input: string) => {
    setCurrentInput(input);
    const text = isComputerMode ? localGameState.text : gameState?.text;
    if (!text) return;

    let correctPosition = 0;
    let errorCount = 0;

    for (let i = 0; i < input.length; i++) {
      if (i >= text.length) break;
      if (input[i] === text[i]) {
        correctPosition = i + 1;
      } else {
        errorCount++;
      }
    }

    setCurrentPosition(correctPosition);
    setErrors(errorCount);

    const progress = (correctPosition / text.length) * 100;

    if (isComputerMode) {
      setLocalGameState((prevState) => {
        const player = prevState.players.find((p) => p.id === playerId);
        if (player?.finished) return prevState;

        const updatedPlayers = prevState.players.map((player) =>
          player.id === playerId
            ? {
                ...player,
                progress,
                wpm: prevState.startTime
                  ? Math.round((correctPosition / 5) / ((Date.now() - prevState.startTime) / 60000))
                  : 0,
                accuracy: correctPosition + errorCount > 0 ? 100 - (errorCount / (correctPosition + errorCount)) * 100 : 100,
              }
            : player
        );

        if (correctPosition === text.length && input.length === text.length) {
          const finishedPlayers = updatedPlayers.filter((p) => p.finished);
          updatedPlayers.forEach((p) => {
            if (p.id === playerId && !p.finished) {
              p.finished = true;
              p.position = finishedPlayers.length + 1;
            }
          });

          const allFinished = updatedPlayers.every((p) => p.finished);
          return {
            ...prevState,
            players: updatedPlayers,
            status: allFinished ? "finished" : prevState.status,
            endTime: allFinished ? Date.now() : prevState.endTime,
          };
        }

        return { ...prevState, players: updatedPlayers };
      });
    } else if (socket && gameState?.status === "racing") {
      updateProgress(progress, correctPosition, errorCount);
      if (correctPosition === text.length && input.length === text.length) {
        playerFinished();
      }
    }
  };

  // Start the race
  const startRace = () => {
    if (isComputerMode) {
      setLocalGameState((prevState) => {
        if (prevState.status !== "waiting") return prevState;
        return { ...prevState, status: "countdown" };
      });

      setTimeout(() => {
        const startTime = Date.now();
        setLocalGameState((prevState) => {
          if (prevState.status !== "countdown") return prevState;
          return { ...prevState, status: "racing", startTime };
        });
        if (typingAreaRef.current) typingAreaRef.current.focus();
        computerPlayers.forEach((bot) => bot.startTyping(handleBotUpdate));
      }, 5000);
    } else {
      startSocketRace();
    }
  };

  // Handle restart
  const handleRestart = () => {
    if (isComputerMode) {
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      computerPlayers.forEach((bot) => bot.stopTyping());
      setCurrentInput("");
      setCurrentPosition(0);
      setErrors(0);

      const newBots = initializeComputerPlayers(randomText);
      setComputerPlayers(newBots);

      setLocalGameState({
        status: "waiting",
        players: [
          {
            id: playerId || `player-${Date.now()}`,
            name: playerName,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            position: 0,
            finished: false,
            color: playerColors[0],
            isBot: false,
          },
          ...newBots,
        ],
        text: randomText,
        startTime: null,
        endTime: null,
      });
      setShowResultsModal(false);
    } else {
      window.location.href = "/create";
    }
  };

  const activeGameState = isComputerMode ? localGameState : gameState;
  const currentPlayer = activeGameState?.players.find((p) => p.id === playerId);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Race #{raceId}</h1>
          <div className="flex items-center justify-between">
            <p className="text-blue-600">
              Status: {activeGameState?.status.charAt(0).toUpperCase() + activeGameState?.status.slice(1)}
            </p>
            {isComputerMode && (
              <div className="flex items-center text-sm text-blue-600">
                <Bot className="mr-1 h-4 w-4" />
                <span>Computer Mode ({difficulty})</span>
              </div>
            )}
          </div>
        </header>

        {activeGameState?.status === "countdown" && (
          <div className="mb-6 text-center">
            <CountdownTimer seconds={5} onComplete={() => {}} />
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-4 h-64">
              <RaceTrack players={activeGameState?.players || []} currentPlayerId={playerId || ""} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              {activeGameState?.status === "racing" || activeGameState?.status === "finished" ? (
                <TypingArea
                  text={activeGameState.text}
                  currentPosition={currentPosition}
                  input={currentInput}
                  onInputChange={handleTyping}
                  disabled={activeGameState.status === "finished" || !!currentPlayer?.finished}
                  ref={typingAreaRef}
                />
              ) : (
                <div className="text-center p-6">
                  <p className="text-lg text-gray-600">
                    {activeGameState?.status === "waiting" ? "Waiting for the race to start..." : "Get ready to race!"}
                  </p>
                  {activeGameState?.status === "waiting" && (
                    <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={startRace}>
                      Start Race
                    </Button>
                  )}
                </div>
              )}
            </div>

            {currentPlayer && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-medium mb-2">Your Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-xl font-bold">{Math.round(currentPlayer.progress)}%</p>
                    <Progress value={currentPlayer.progress} className="mt-1" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Speed</p>
                    <p className="text-xl font-bold">{Math.round(currentPlayer.wpm)} WPM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Accuracy</p>
                    <p className="text-xl font-bold">{Math.round(currentPlayer.accuracy)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 h-fit">
            <Leaderboard players={activeGameState?.players || []} currentPlayerId={playerId || ""} />
          </div>
        </div>
      </div>

      {activeGameState?.status === "finished" && activeGameState?.players && Array.isArray(activeGameState.players) && (
        <RaceResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          players={activeGameState.players}
          currentPlayerId={playerId || ""}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}