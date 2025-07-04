const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(__dirname));

// Game rooms storage
const gameRooms = new Map();
const playerConnections = new Map();

class GameRoom {
    constructor(id, hostName) {
        this.id = id;
        this.hostName = hostName;
        this.players = [];
        this.gameState = null;
        this.gameStarted = false;
        this.maxPlayers = 4;
        this.currentPlayerIndex = 0;
        this.createdAt = new Date();
    }

    addPlayer(playerId, playerName, socketId) {
        if (this.players.length >= this.maxPlayers) {
            return false;
        }
        
        const player = {
            id: playerId,
            name: playerName,
            socketId: socketId,
            money: 1500,
            position: 0,
            properties: [],
            inJail: false,
            jailTurns: 0,
            connected: true
        };
        
        this.players.push(player);
        return true;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
    }

    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }

    initializeGameState() {
        this.gameState = {
            boardSpaces: this.initializeBoardSpaces(),
            lastDiceRoll: [0, 0],
            diceRolled: false,
            gameStarted: true
        };
        this.gameStarted = true;
    }

    initializeBoardSpaces() {
        return [
            { name: "GO", type: "corner", price: 0, owner: null, rent: 0 },
            { name: "Mediterranean Ave", type: "property", price: 60, owner: null, rent: 2, colorGroup: "brown" },
            { name: "Community Chest", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Baltic Ave", type: "property", price: 60, owner: null, rent: 4, colorGroup: "brown" },
            { name: "Income Tax", type: "tax", price: 200, owner: null, rent: 0 },
            { name: "Reading Railroad", type: "railroad", price: 200, owner: null, rent: 25 },
            { name: "Oriental Ave", type: "property", price: 100, owner: null, rent: 6, colorGroup: "light-blue" },
            { name: "Chance", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Vermont Ave", type: "property", price: 100, owner: null, rent: 6, colorGroup: "light-blue" },
            { name: "Connecticut Ave", type: "property", price: 120, owner: null, rent: 8, colorGroup: "light-blue" },
            { name: "Jail", type: "corner", price: 0, owner: null, rent: 0 },
            { name: "St. Charles Place", type: "property", price: 140, owner: null, rent: 10, colorGroup: "pink" },
            { name: "Electric Company", type: "utility", price: 150, owner: null, rent: 0 },
            { name: "States Ave", type: "property", price: 140, owner: null, rent: 10, colorGroup: "pink" },
            { name: "Virginia Ave", type: "property", price: 160, owner: null, rent: 12, colorGroup: "pink" },
            { name: "Pennsylvania Railroad", type: "railroad", price: 200, owner: null, rent: 25 },
            { name: "St. James Place", type: "property", price: 180, owner: null, rent: 14, colorGroup: "orange" },
            { name: "Community Chest", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Tennessee Ave", type: "property", price: 180, owner: null, rent: 14, colorGroup: "orange" },
            { name: "New York Ave", type: "property", price: 200, owner: null, rent: 16, colorGroup: "orange" },
            { name: "Free Parking", type: "corner", price: 0, owner: null, rent: 0 },
            { name: "Kentucky Ave", type: "property", price: 220, owner: null, rent: 18, colorGroup: "red" },
            { name: "Chance", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Indiana Ave", type: "property", price: 220, owner: null, rent: 18, colorGroup: "red" },
            { name: "Illinois Ave", type: "property", price: 240, owner: null, rent: 20, colorGroup: "red" },
            { name: "B. & O. Railroad", type: "railroad", price: 200, owner: null, rent: 25 },
            { name: "Atlantic Ave", type: "property", price: 260, owner: null, rent: 22, colorGroup: "yellow" },
            { name: "Ventnor Ave", type: "property", price: 260, owner: null, rent: 22, colorGroup: "yellow" },
            { name: "Water Works", type: "utility", price: 150, owner: null, rent: 0 },
            { name: "Marvin Gardens", type: "property", price: 280, owner: null, rent: 24, colorGroup: "yellow" },
            { name: "Go To Jail", type: "corner", price: 0, owner: null, rent: 0 },
            { name: "Pacific Ave", type: "property", price: 300, owner: null, rent: 26, colorGroup: "green" },
            { name: "North Carolina Ave", type: "property", price: 300, owner: null, rent: 26, colorGroup: "green" },
            { name: "Community Chest", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Pennsylvania Ave", type: "property", price: 320, owner: null, rent: 28, colorGroup: "green" },
            { name: "Short Line Railroad", type: "railroad", price: 200, owner: null, rent: 25 },
            { name: "Chance", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Park Place", type: "property", price: 350, owner: null, rent: 35, colorGroup: "blue" },
            { name: "Luxury Tax", type: "tax", price: 100, owner: null, rent: 0 },
            { name: "Boardwalk", type: "property", price: 400, owner: null, rent: 50, colorGroup: "blue" }
        ];
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create a new game room
    socket.on('createGame', (data) => {
        const roomId = uuidv4().substring(0, 8).toUpperCase();
        const playerId = uuidv4();
        const room = new GameRoom(roomId, data.playerName);
        
        room.addPlayer(playerId, data.playerName, socket.id);
        gameRooms.set(roomId, room);
        playerConnections.set(socket.id, { playerId, roomId });
        
        socket.join(roomId);
        
        socket.emit('gameCreated', {
            roomId: roomId,
            playerId: playerId,
            room: {
                id: room.id,
                hostName: room.hostName,
                players: room.players,
                gameStarted: room.gameStarted
            }
        });
        
        console.log(`Game room ${roomId} created by ${data.playerName}`);
    });

    // Join an existing game room
    socket.on('joinGame', (data) => {
        const room = gameRooms.get(data.roomId);
        
        if (!room) {
            socket.emit('error', { message: 'Game room not found' });
            return;
        }
        
        if (room.players.length >= room.maxPlayers) {
            socket.emit('error', { message: 'Game room is full' });
            return;
        }
        
        if (room.gameStarted) {
            socket.emit('error', { message: 'Game has already started' });
            return;
        }
        
        const playerId = uuidv4();
        room.addPlayer(playerId, data.playerName, socket.id);
        playerConnections.set(socket.id, { playerId, roomId: data.roomId });
        
        socket.join(data.roomId);
        
        // Notify all players in the room
        io.to(data.roomId).emit('playerJoined', {
            playerId: playerId,
            playerName: data.playerName,
            room: {
                id: room.id,
                hostName: room.hostName,
                players: room.players,
                gameStarted: room.gameStarted
            }
        });
        
        console.log(`${data.playerName} joined game room ${data.roomId}`);
    });

    // List available game rooms
    socket.on('listGames', () => {
        const availableRooms = Array.from(gameRooms.values())
            .filter(room => !room.gameStarted && room.players.length < room.maxPlayers)
            .map(room => ({
                id: room.id,
                hostName: room.hostName,
                playerCount: room.players.length,
                maxPlayers: room.maxPlayers,
                createdAt: room.createdAt
            }));
        
        socket.emit('gamesList', availableRooms);
    });

    // Start game
    socket.on('startGame', () => {
        const connection = playerConnections.get(socket.id);
        if (!connection) return;
        
        const room = gameRooms.get(connection.roomId);
        if (!room) return;
        
        // Only host can start the game
        const player = room.getPlayer(connection.playerId);
        if (!player || player.name !== room.hostName) {
            socket.emit('error', { message: 'Only the host can start the game' });
            return;
        }
        
        if (room.players.length < 2) {
            socket.emit('error', { message: 'Need at least 2 players to start' });
            return;
        }
        
        room.initializeGameState();
        
        // Notify all players that the game has started
        io.to(connection.roomId).emit('gameStarted', {
            room: {
                id: room.id,
                players: room.players,
                gameState: room.gameState,
                currentPlayerIndex: room.currentPlayerIndex
            }
        });
        
        console.log(`Game started in room ${connection.roomId}`);
    });

    // Handle game actions
    socket.on('gameAction', (data) => {
        const connection = playerConnections.get(socket.id);
        if (!connection) return;
        
        const room = gameRooms.get(connection.roomId);
        if (!room || !room.gameStarted) return;
        
        // Verify it's the current player's turn
        const currentPlayer = room.players[room.currentPlayerIndex];
        if (currentPlayer.id !== connection.playerId) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        
        // Process the game action based on type
        switch (data.type) {
            case 'rollDice':
                handleRollDice(room, connection.playerId);
                break;
            case 'buyProperty':
                handleBuyProperty(room, connection.playerId, data.spaceId);
                break;
            case 'endTurn':
                handleEndTurn(room);
                break;
            // Add more game actions as needed
        }
        
        // Broadcast updated game state to all players
        io.to(connection.roomId).emit('gameStateUpdate', {
            room: {
                players: room.players,
                gameState: room.gameState,
                currentPlayerIndex: room.currentPlayerIndex
            }
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const connection = playerConnections.get(socket.id);
        if (connection) {
            const room = gameRooms.get(connection.roomId);
            if (room) {
                const player = room.getPlayer(connection.playerId);
                if (player) {
                    player.connected = false;
                    
                    // Notify other players
                    socket.to(connection.roomId).emit('playerDisconnected', {
                        playerId: connection.playerId,
                        playerName: player.name
                    });
                    
                    console.log(`${player.name} disconnected from room ${connection.roomId}`);
                }
            }
            playerConnections.delete(socket.id);
        }
        console.log('Client disconnected:', socket.id);
    });
});

// Game action handlers
function handleRollDice(room, playerId) {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    room.gameState.lastDiceRoll = [dice1, dice2];
    room.gameState.diceRolled = true;
    
    const player = room.getPlayer(playerId);
    const total = dice1 + dice2;
    player.position = (player.position + total) % 40;
}

function handleBuyProperty(room, playerId, spaceId) {
    const player = room.getPlayer(playerId);
    const space = room.gameState.boardSpaces[spaceId];
    
    if (space.owner === null && space.price > 0 && player.money >= space.price) {
        space.owner = playerId;
        player.money -= space.price;
        player.properties.push(spaceId);
    }
}

function handleEndTurn(room) {
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    room.gameState.diceRolled = false;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});