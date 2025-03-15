# Typing Race Game

Welcome to **Typing Race Game**, a real-time typing competition application built with Next.js (React), TypeScript, Socket.IO, and Node.js. Test your typing skills against computer opponents or (in development) race against other players online!

## Overview

Typing Race Game allows users to practice their typing speed and accuracy in an engaging, race-themed environment. The project features a sleek UI with a race track visualization, real-time progress updates, and a leaderboard. Currently, it supports practice mode and player vs. computer mode, with multiplayer mode actively in development.

## Features

- **Real-Time Typing Feedback**: See your progress, WPM (words per minute), and accuracy as you type.
- **Race Track Visualization**: Watch your car move along the track based on your typing progress.
- **Leaderboard**: View rankings and stats for all participants in the race.
- **Countdown Timer**: A 5-second countdown before the race begins.
- **Results Modal**: Displays final standings and stats after the race ends.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Game Modes

### 1. Practice Mode
- **Description**: A solo mode where you can type a randomly selected text at your own pace.
- **Status**: Fully working.
- **How to Play**: Access via the race page without specifying a mode (e.g., `/race/test?name=Player1`).

### 2. Player vs. Computer
- **Description**: Compete against AI-controlled bots with customizable difficulty levels (easy, medium, hard).
- **Status**: Fully working.
- **How to Play**: Navigate to `/race/[raceId]?mode=computer&name=Player1&difficulty=medium&bots=3`.
  - `difficulty`: `easy`, `medium`, `hard`, or `mixed`.
  - `bots`: Number of computer opponents (default: 3).

### 3. Multiplayer Mode
- **Description**: Race against other real players in real-time using Socket.IO for synchronization.
- **Status**: Complete but some users have needed to refresh the page to sync with other players
- **How to Play (WIP)**:
  1. Create a race at `/create`.
  2. Share the race code with friends.
  3. Join via `/join` with the code.
  4. Start the race from the race page (`/race/[raceId]`).

## Prerequisites

- **Node.js**: v16.x or higher
- **npm**: v7.x or higher (or use yarn/pnpm if preferred)

## Project Setup

### Backend
1. **Navigate to the backend directory** ([git/racer-socket](https://github.com/johnmiicheal/racer-socket.git)):
   ```bash
   cd backend
   ```
2. **Install dependencies** (if using npm):
   ```bash
   npm install
   ```
3. **Run the backend server** (if using npm):
   ```bash
   npm run dev
   ```

### Frontend
1. **Install dependencies** (if using npm):
   ```bash
   npm install
   ```
2. **Run the frontend development server** (if using npm):
   ```bash
   npm run dev
   ```
 - Runs on https://localhost:3000

## Development Status
- Practice Mode: Complete and stable.
- Player vs. Computer: Complete and stable.
- Multiplayer Mode: Complete and mostly stable.


## Future Improvements
- Bot + Players: Fix Bots + Players in private races
- Custom Texts: Allow users to input custom typing texts.
- Enhanced UI: Add animations and sound effects for a more immersive experience.


## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
Built with Next.js, Socket.IO, and Shadcn/UI.
Inspired by typing race games like [TypeRacer](https://typeracer.com) and [Nitro Type](https://nitrotype.com).