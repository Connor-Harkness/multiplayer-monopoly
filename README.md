# Monopoly - Multiplayer

A responsive multiplayer monopoly clone that works across multiple devices with real-time multiplayer functionality.

## Features

- **Multiplayer Lobby System**: Create and join game rooms with unique room codes
- **Real-time Gameplay**: Synchronized game state across all connected players
- **Responsive Design**: Works on mobile phones, tablets, and desktop computers
- **Progressive Web App**: Can be installed on mobile devices for offline play
- **Classic Monopoly Rules**: Buy properties, collect rent, and pass GO
- **Game State Persistence**: Server-side game state management
- **Connection Management**: Handle player disconnections and reconnections
- **2-4 Players**: Support for 2 to 4 players per game room

## How to Play (Multiplayer)

### Starting a Game
1. Run the server: `npm start`
2. Open `http://localhost:3000` in multiple browser tabs/devices
3. **Host**: Enter your name and click "Create New Game" - you'll get a room code
4. **Players**: Enter your name, click "Join Game", and either:
   - Select the host's game from the available games list, OR
   - Enter the room code manually
5. **Host**: Click "Start Game" when all players have joined (minimum 2 players)

### Gameplay
- Players take turns automatically (indicated by "Current Player: [Name]")
- Only the current player can roll dice and make moves
- Game state syncs instantly across all players
- All players see real-time updates of moves, purchases, and money

## Technical Architecture

### Server (Node.js + Socket.IO)
- **Express Server**: Serves static files and handles HTTP requests
- **Socket.IO**: Real-time WebSocket communication
- **Game Rooms**: Server-side game state management with unique room IDs
- **Player Management**: Connection tracking and disconnection handling

### Client (HTML + CSS + JavaScript)
- **WebSocket Client**: Connects to server via Socket.IO
- **Multiplayer UI**: Lobby system with room creation/joining
- **Game Synchronization**: Real-time game state updates
- **Responsive Design**: Mobile-first approach with CSS Grid

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm

### Quick Start
```bash
# Install dependencies
npm install

# Start the server
npm start

# Open http://localhost:3000 in multiple browser tabs/devices
```

### Development
```bash
# Install development dependencies
npm install

# Start with auto-reload (requires nodemon)
npm run dev
```

## Game Rules

- Each player starts with $1500
- Collect $200 when passing or landing on GO
- Buy properties by clicking "Buy Property" when landing on unowned spaces
- Pay rent to other players when landing on their properties
- Simplified Chance/Community Chest cards with random effects
- Game state is automatically saved on the server

## Technical Features

- **Node.js Backend**: Express server with Socket.IO for real-time communication
- **Multiplayer Lobby**: Room creation, joining, and game listing
- **Real-time Sync**: Instant game state synchronization across all players
- **Player Management**: Connection status, disconnection handling
- **Responsive Design**: CSS Grid layout with mobile-first approach
- **Progressive Web App**: Service Worker for offline functionality
- **Game Persistence**: Server-side state management

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers supporting ES6 and WebSockets

## File Structure

```
/
├── server.js           # Node.js server with Socket.IO
├── package.json        # Dependencies and scripts
├── index.html          # Main game HTML with multiplayer UI
├── styles.css          # Responsive CSS styles with lobby UI
├── script.js           # Multiplayer game logic and WebSocket client
├── script-original.js  # Original pass-and-play version (backup)
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md          # This file
```

## API Reference

### Socket.IO Events

#### Client to Server
- `createGame` - Create a new game room
- `joinGame` - Join an existing game room
- `listGames` - Get list of available games
- `startGame` - Start the game (host only)
- `gameAction` - Send game actions (rollDice, buyProperty, endTurn)

#### Server to Client  
- `gameCreated` - Room created successfully
- `playerJoined` - Player joined the room
- `gamesList` - Available games list
- `gameStarted` - Game started
- `gameStateUpdate` - Real-time game state updates
- `playerDisconnected` - Player disconnected
- `error` - Error messages

## Deployment

### Local Development
```bash
npm start
# Server runs on http://localhost:3000
```

### Production Deployment
The app can be deployed to any Node.js hosting platform (Heroku, Railway, etc.):

1. Set `PORT` environment variable for hosting platform
2. Ensure all dependencies are in `package.json`
3. Use `npm start` as the start command

## License

MIT License - Feel free to use and modify!

---

*Transformed from pass-and-play to true multiplayer with lobby system!*