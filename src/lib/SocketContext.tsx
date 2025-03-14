"use client"

// lib/SocketContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define your interfaces (same as backend)
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
  id: string;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  players: Player[];
  text: string;
  startTime: number | null;
  endTime: number | null;
  isComputerMode: boolean;
  computerPlayers: Player[];
}

interface SocketContextType {
  socket: Socket | null;
  gameState: GameState | null;
  connectSocket: (raceId: string, playerName: string, isComputerMode?: boolean, numBots?: number, difficulty?: string) => void;
  startRace: () => void;
  updateProgress: (progress: number, position: number, errors: number) => void;
  playerFinished: () => void;
}
const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const connectSocket = useCallback((raceId: string, playerName: string, isComputerMode = false, numBots = 3, difficulty = 'medium') => {
    if (socket) socket.disconnect();

    const newSocket = io('http://localhost:4000', {
      query: { raceId, playerName, isComputerMode: isComputerMode.toString(), numBots: numBots.toString(), difficulty },
    });

    newSocket.on('connect', () => console.log('Connected:', newSocket.id));
    newSocket.on('gameState', setGameState);
    newSocket.on('error', (error) => console.error('Socket error:', error));
    setSocket(newSocket);
  }, [socket]);

  const startRace = useCallback(() => socket?.emit('startRace'), [socket]);
  const updateProgress = useCallback((progress: number, position: number, errors: number) => {
    socket?.emit('updateProgress', { progress, position, errors });
  }, [socket]);
  const playerFinished = useCallback(() => socket?.emit('playerFinished'), [socket]);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, gameState, connectSocket, startRace, updateProgress, playerFinished }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};