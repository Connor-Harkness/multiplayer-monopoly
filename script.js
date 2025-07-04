// Multiplayer Monopoly Game Logic
class MultiplayerMonopolyGame {
    constructor() {
        this.socket = null;
        this.playerId = null;
        this.roomId = null;
        this.isHost = false;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.boardSpaces = [];
        this.lastDiceRoll = [0, 0];
        this.diceRolled = false;
        
        this.initializeConnection();
        this.initializeEventListeners();
    }

    initializeConnection() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            document.getElementById('connection-status').textContent = 'Connected';
            document.getElementById('connection-status').style.color = 'green';
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            document.getElementById('connection-status').textContent = 'Disconnected';
            document.getElementById('connection-status').style.color = 'red';
        });

        this.socket.on('gameCreated', (data) => {
            this.playerId = data.playerId;
            this.roomId = data.roomId;
            this.isHost = true;
            this.players = data.room.players;
            this.showGameRoom(data.room);
        });

        this.socket.on('playerJoined', (data) => {
            this.players = data.room.players;
            this.updateRoomPlayers();
            this.showMessage(`${data.playerName} joined the game!`);
        });

        this.socket.on('gamesList', (games) => {
            this.displayAvailableGames(games);
        });

        this.socket.on('gameStarted', (data) => {
            this.players = data.room.players;
            this.boardSpaces = data.room.gameState.boardSpaces;
            this.currentPlayerIndex = data.room.currentPlayerIndex;
            this.gameStarted = true;
            this.startGame();
        });

        this.socket.on('gameStateUpdate', (data) => {
            this.players = data.room.players;
            this.boardSpaces = data.room.gameState.boardSpaces;
            this.currentPlayerIndex = data.room.currentPlayerIndex;
            this.lastDiceRoll = data.room.gameState.lastDiceRoll;
            this.diceRolled = data.room.gameState.diceRolled;
            this.updateGameDisplay();
        });

        this.socket.on('playerDisconnected', (data) => {
            this.showMessage(`${data.playerName} disconnected from the game`);
        });

        this.socket.on('error', (data) => {
            alert(`Error: ${data.message}`);
        });
    }

    initializeEventListeners() {
        // Lobby event listeners
        document.getElementById('create-game-btn').addEventListener('click', () => {
            const playerName = document.getElementById('player-name-input').value.trim();
            if (!playerName) {
                alert('Please enter your name');
                return;
            }
            this.createGame(playerName);
        });

        document.getElementById('join-game-btn').addEventListener('click', () => {
            this.showJoinGameSection();
        });

        document.getElementById('refresh-games-btn').addEventListener('click', () => {
            this.refreshGamesList();
        });

        document.getElementById('join-by-code-btn').addEventListener('click', () => {
            const playerName = document.getElementById('player-name-input').value.trim();
            const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
            if (!playerName || !roomCode) {
                alert('Please enter your name and room code');
                return;
            }
            this.joinGame(roomCode, playerName);
        });

        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.socket.emit('startGame');
        });

        document.getElementById('leave-room-btn').addEventListener('click', () => {
            this.leaveRoom();
        });

        // Game event listeners
        document.getElementById('roll-dice').addEventListener('click', () => {
            if (this.isMyTurn()) {
                this.socket.emit('gameAction', { type: 'rollDice' });
            }
        });

        document.getElementById('end-turn').addEventListener('click', () => {
            if (this.isMyTurn()) {
                this.socket.emit('gameAction', { type: 'endTurn' });
            }
        });

        document.getElementById('buy-property').addEventListener('click', () => {
            if (this.isMyTurn()) {
                const currentPlayer = this.players.find(p => p.id === this.playerId);
                this.socket.emit('gameAction', { 
                    type: 'buyProperty', 
                    spaceId: currentPlayer.position 
                });
            }
        });

        // Modal close handlers
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').classList.remove('active');
            });
        });
    }

    createGame(playerName) {
        this.socket.emit('createGame', { playerName });
    }

    joinGame(roomId, playerName) {
        this.socket.emit('joinGame', { roomId, playerName });
    }

    showJoinGameSection() {
        document.getElementById('join-game-section').style.display = 'block';
        this.refreshGamesList();
    }

    refreshGamesList() {
        this.socket.emit('listGames');
    }

    displayAvailableGames(games) {
        const gamesList = document.getElementById('games-list');
        gamesList.innerHTML = '';

        if (games.length === 0) {
            gamesList.innerHTML = '<p>No available games. Create a new one!</p>';
            return;
        }

        games.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-item';
            gameDiv.innerHTML = `
                <div class="game-info">
                    <strong>Room: ${game.id}</strong><br>
                    Host: ${game.hostName}<br>
                    Players: ${game.playerCount}/${game.maxPlayers}
                </div>
                <button onclick="game.joinGameById('${game.id}')">Join</button>
            `;
            gamesList.appendChild(gameDiv);
        });
    }

    joinGameById(roomId) {
        const playerName = document.getElementById('player-name-input').value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        this.joinGame(roomId, playerName);
    }

    showGameRoom(room) {
        document.getElementById('lobby-options').style.display = 'none';
        document.getElementById('join-game-section').style.display = 'none';
        document.getElementById('game-room-section').style.display = 'block';
        
        document.getElementById('room-code').textContent = room.id;
        
        if (this.isHost) {
            document.getElementById('start-game-btn').style.display = 'block';
        }
        
        this.updateRoomPlayers();
    }

    updateRoomPlayers() {
        const playersDiv = document.getElementById('room-players');
        playersDiv.innerHTML = '';

        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'room-player';
            playerDiv.innerHTML = `
                <span class="player-name">${player.name}</span>
                ${player.id === this.playerId ? '<span class="you-indicator">(You)</span>' : ''}
                ${!player.connected ? '<span class="disconnected-indicator">(Disconnected)</span>' : ''}
            `;
            playersDiv.appendChild(playerDiv);
        });
    }

    leaveRoom() {
        this.socket.disconnect();
        location.reload();
    }

    startGame() {
        document.getElementById('lobby-modal').classList.remove('active');
        document.getElementById('current-player').style.display = 'block';
        
        this.renderPlayerCards();
        this.updateCurrentPlayer();
        this.renderPlayerPieces();
        this.updateActionButtons();
        this.updateGameDisplay();
    }

    isMyTurn() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        return currentPlayer && currentPlayer.id === this.playerId;
    }

    renderPlayerCards() {
        const container = document.getElementById('players-list');
        container.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.id = `player-card-${index}`;
            
            card.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-money">$${player.money}</div>
                <div class="player-piece piece-${index}"></div>
                ${!player.connected ? '<div class="disconnected-indicator">Disconnected</div>' : ''}
            `;
            
            container.appendChild(card);
        });
    }

    updateCurrentPlayer() {
        if (this.players.length > 0) {
            const currentPlayer = this.players[this.currentPlayerIndex];
            document.getElementById('player-name').textContent = currentPlayer.name;
            
            // Update active player card
            document.querySelectorAll('.player-card').forEach(card => {
                card.classList.remove('active');
            });
            document.getElementById(`player-card-${this.currentPlayerIndex}`).classList.add('active');
        }
    }

    renderPlayerPieces() {
        // Remove all existing player pieces
        document.querySelectorAll('.player-on-space').forEach(piece => piece.remove());
        
        this.players.forEach((player, index) => {
            const space = document.getElementById(`space-${player.position}`);
            if (space) {
                const piece = document.createElement('div');
                piece.className = `player-on-space piece-${index}`;
                space.appendChild(piece);
            }
        });
    }

    updateActionButtons() {
        const diceButton = document.getElementById('roll-dice');
        const endTurnButton = document.getElementById('end-turn');
        const buyPropertyButton = document.getElementById('buy-property');
        const payRentButton = document.getElementById('pay-rent');
        
        const isMyTurn = this.isMyTurn();
        
        diceButton.disabled = !isMyTurn || this.diceRolled;
        endTurnButton.disabled = !isMyTurn || !this.diceRolled;
        buyPropertyButton.disabled = true;
        payRentButton.disabled = true;
        
        if (isMyTurn && this.diceRolled) {
            const currentPlayer = this.players.find(p => p.id === this.playerId);
            if (currentPlayer) {
                const space = this.boardSpaces[currentPlayer.position];
                if (space && space.type === 'property' && space.owner === null && currentPlayer.money >= space.price) {
                    buyPropertyButton.disabled = false;
                }
            }
        }
    }

    updateGameDisplay() {
        this.renderPlayerCards();
        this.updateCurrentPlayer();
        this.renderPlayerPieces();
        this.updateActionButtons();
        this.updateDiceDisplay();
    }

    updateDiceDisplay() {
        if (this.lastDiceRoll) {
            document.getElementById('dice1').textContent = this.lastDiceRoll[0];
            document.getElementById('dice2').textContent = this.lastDiceRoll[1];
        }
    }

    showMessage(message) {
        const modal = document.getElementById('game-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h3>Game Update</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <button onclick="game.closeModal()" class="action-button">OK</button>
        `;
        
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('game-modal').classList.remove('active');
    }
}

// Initialize game when page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new MultiplayerMonopolyGame();
});