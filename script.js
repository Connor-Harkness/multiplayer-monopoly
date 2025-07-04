// Monopoly Game Logic
class MonopolyGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.boardSpaces = this.initializeBoardSpaces();
        this.lastDiceRoll = [0, 0];
        this.diceRolled = false;
        
        this.initializeEventListeners();
        this.initializeSetup();
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
            { name: "Short Line", type: "railroad", price: 200, owner: null, rent: 25 },
            { name: "Chance", type: "chance", price: 0, owner: null, rent: 0 },
            { name: "Park Place", type: "property", price: 350, owner: null, rent: 35, colorGroup: "blue" },
            { name: "Luxury Tax", type: "tax", price: 100, owner: null, rent: 0 },
            { name: "Boardwalk", type: "property", price: 400, owner: null, rent: 50, colorGroup: "blue" }
        ];
    }

    initializeEventListeners() {
        // Setup modal
        document.getElementById('num-players').addEventListener('change', this.updatePlayerNameInputs.bind(this));
        document.getElementById('start-game').addEventListener('click', this.startGame.bind(this));
        
        // Game controls
        document.getElementById('roll-dice').addEventListener('click', this.rollDice.bind(this));
        document.getElementById('end-turn').addEventListener('click', this.endTurn.bind(this));
        document.getElementById('buy-property').addEventListener('click', this.buyProperty.bind(this));
        document.getElementById('pay-rent').addEventListener('click', this.payRent.bind(this));
        
        // Modal close
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.closeModal.bind(this));
        });
        
        // Click outside modal to close
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    initializeSetup() {
        this.updatePlayerNameInputs();
    }

    updatePlayerNameInputs() {
        const numPlayers = parseInt(document.getElementById('num-players').value);
        const container = document.getElementById('player-names');
        
        container.innerHTML = '';
        
        for (let i = 0; i < numPlayers; i++) {
            const div = document.createElement('div');
            div.className = 'player-name-input';
            div.innerHTML = `
                <label>Player ${i + 1} Name:</label>
                <input type="text" value="Player ${i + 1}" maxlength="15">
            `;
            container.appendChild(div);
        }
    }

    startGame() {
        const numPlayers = parseInt(document.getElementById('num-players').value);
        const nameInputs = document.querySelectorAll('#player-names input');
        
        this.players = [];
        
        for (let i = 0; i < numPlayers; i++) {
            this.players.push({
                id: i,
                name: nameInputs[i].value || `Player ${i + 1}`,
                money: 1500,
                position: 0,
                properties: [],
                inJail: false,
                jailTurns: 0
            });
        }
        
        this.gameStarted = true;
        this.currentPlayerIndex = 0;
        
        this.closeModal();
        this.renderPlayerCards();
        this.updateCurrentPlayer();
        this.renderPlayerPieces();
        this.updateActionButtons();
    }

    renderPlayerCards() {
        const container = document.getElementById('players-list');
        container.innerHTML = '';
        
        this.players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.id = `player-card-${player.id}`;
            
            card.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-money">$${player.money}</div>
                <div class="player-piece piece-${player.id}"></div>
            `;
            
            container.appendChild(card);
        });
    }

    updateCurrentPlayer() {
        document.getElementById('player-name').textContent = this.players[this.currentPlayerIndex].name;
        
        // Update active player card
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('active');
        });
        document.getElementById(`player-card-${this.currentPlayerIndex}`).classList.add('active');
    }

    renderPlayerPieces() {
        // Remove all existing player pieces
        document.querySelectorAll('.player-on-space').forEach(piece => piece.remove());
        
        this.players.forEach(player => {
            const space = document.getElementById(`space-${player.position}`);
            const piece = document.createElement('div');
            piece.className = `player-on-space piece-${player.id}`;
            space.appendChild(piece);
        });
    }

    rollDice() {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        
        this.lastDiceRoll = [dice1, dice2];
        this.diceRolled = true;
        
        // Animate dice
        const dice1El = document.getElementById('dice1');
        const dice2El = document.getElementById('dice2');
        
        dice1El.classList.add('rolling');
        dice2El.classList.add('rolling');
        
        setTimeout(() => {
            dice1El.textContent = dice1;
            dice2El.textContent = dice2;
            dice1El.classList.remove('rolling');
            dice2El.classList.remove('rolling');
            
            this.movePlayer(dice1 + dice2);
        }, 500);
        
        document.getElementById('roll-dice').disabled = true;
    }

    movePlayer(spaces) {
        const player = this.players[this.currentPlayerIndex];
        const oldPosition = player.position;
        
        player.position = (player.position + spaces) % 40;
        
        // Check if player passed GO
        if (player.position < oldPosition) {
            player.money += 200;
            this.showMessage(`${player.name} passed GO and collected $200!`);
        }
        
        this.renderPlayerPieces();
        this.updatePlayerDisplay();
        this.handleLandedSpace();
    }

    handleLandedSpace() {
        const player = this.players[this.currentPlayerIndex];
        const space = this.boardSpaces[player.position];
        
        let message = `${player.name} landed on ${space.name}`;
        
        switch (space.type) {
            case 'property':
            case 'railroad':
            case 'utility':
                if (space.owner === null) {
                    message += `\nWould you like to buy ${space.name} for $${space.price}?`;
                    this.showPropertyOptions(space);
                } else if (space.owner !== player.id) {
                    const rent = this.calculateRent(space);
                    message += `\nYou owe $${rent} rent to ${this.players[space.owner].name}`;
                    this.showRentOptions(space, rent);
                } else {
                    message += `\nYou own this property.`;
                }
                break;
            case 'tax':
                message += `\nPay $${space.price} in taxes.`;
                this.payTax(space.price);
                break;
            case 'chance':
                message += `\nDraw a card!`;
                this.handleChanceCard();
                break;
            case 'corner':
                this.handleCornerSpace(space);
                break;
        }
        
        this.showMessage(message);
        this.updateActionButtons();
    }

    calculateRent(space) {
        if (space.type === 'railroad') {
            const railroadsOwned = this.boardSpaces.filter(s => 
                s.type === 'railroad' && s.owner === space.owner
            ).length;
            return 25 * Math.pow(2, railroadsOwned - 1);
        } else if (space.type === 'utility') {
            const utilitiesOwned = this.boardSpaces.filter(s => 
                s.type === 'utility' && s.owner === space.owner
            ).length;
            const multiplier = utilitiesOwned === 1 ? 4 : 10;
            return multiplier * (this.lastDiceRoll[0] + this.lastDiceRoll[1]);
        } else {
            return space.rent;
        }
    }

    showPropertyOptions(space) {
        document.getElementById('buy-property').disabled = false;
        document.getElementById('buy-property').onclick = () => this.buyProperty(space);
    }

    showRentOptions(space, rent) {
        document.getElementById('pay-rent').disabled = false;
        document.getElementById('pay-rent').onclick = () => this.payRent(space, rent);
    }

    buyProperty(space = null) {
        if (!space) {
            const player = this.players[this.currentPlayerIndex];
            space = this.boardSpaces[player.position];
        }
        
        const player = this.players[this.currentPlayerIndex];
        
        if (player.money >= space.price) {
            player.money -= space.price;
            player.properties.push(space.name);
            space.owner = player.id;
            
            // Add visual ownership indicator
            const spaceElement = document.getElementById(`space-${player.position}`);
            spaceElement.classList.add(`owned-${player.id}`);
            
            this.showMessage(`${player.name} bought ${space.name} for $${space.price}!`);
            this.updatePlayerDisplay();
        } else {
            this.showMessage(`${player.name} doesn't have enough money to buy ${space.name}.`);
        }
        
        document.getElementById('buy-property').disabled = true;
        this.updateActionButtons();
    }

    payRent(space = null, rent = null) {
        if (!space) {
            const player = this.players[this.currentPlayerIndex];
            space = this.boardSpaces[player.position];
            rent = this.calculateRent(space);
        }
        
        const player = this.players[this.currentPlayerIndex];
        const owner = this.players[space.owner];
        
        if (player.money >= rent) {
            player.money -= rent;
            owner.money += rent;
            
            this.showMessage(`${player.name} paid $${rent} rent to ${owner.name}.`);
        } else {
            this.showMessage(`${player.name} doesn't have enough money! (Game would normally end here)`);
        }
        
        this.updatePlayerDisplay();
        document.getElementById('pay-rent').disabled = true;
        this.updateActionButtons();
    }

    payTax(amount) {
        const player = this.players[this.currentPlayerIndex];
        player.money -= amount;
        this.updatePlayerDisplay();
    }

    handleChanceCard() {
        const cards = [
            "Advance to GO (Collect $200)",
            "Bank pays you dividend of $50",
            "Go back 3 spaces",
            "Pay poor tax of $15",
            "Take a trip to Reading Railroad",
            "Pay school fees of $150"
        ];
        
        const card = cards[Math.floor(Math.random() * cards.length)];
        this.showMessage(`Chance: ${card}`);
        
        // Simplified card effects
        const player = this.players[this.currentPlayerIndex];
        switch (card) {
            case "Advance to GO (Collect $200)":
                player.position = 0;
                player.money += 200;
                break;
            case "Bank pays you dividend of $50":
                player.money += 50;
                break;
            case "Go back 3 spaces":
                player.position = Math.max(0, player.position - 3);
                break;
            case "Pay poor tax of $15":
                player.money -= 15;
                break;
            case "Pay school fees of $150":
                player.money -= 150;
                break;
        }
        
        this.renderPlayerPieces();
        this.updatePlayerDisplay();
    }

    handleCornerSpace(space) {
        const player = this.players[this.currentPlayerIndex];
        
        switch (space.name) {
            case "GO":
                player.money += 200;
                this.showMessage(`${player.name} is on GO and collected $200!`);
                break;
            case "Go To Jail":
                player.position = 10; // Jail position
                player.inJail = true;
                this.showMessage(`${player.name} goes to jail!`);
                break;
        }
        
        this.updatePlayerDisplay();
    }

    endTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.diceRolled = false;
        
        this.updateCurrentPlayer();
        this.updateActionButtons();
        
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('buy-property').disabled = true;
        document.getElementById('pay-rent').disabled = true;
    }

    updateActionButtons() {
        const diceButton = document.getElementById('roll-dice');
        const endTurnButton = document.getElementById('end-turn');
        
        diceButton.disabled = this.diceRolled;
        endTurnButton.disabled = !this.diceRolled;
    }

    updatePlayerDisplay() {
        this.players.forEach(player => {
            const moneyElement = document.querySelector(`#player-card-${player.id} .player-money`);
            if (moneyElement) {
                moneyElement.textContent = `$${player.money}`;
            }
        });
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
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Save/Load game state for mobile compatibility
    saveGame() {
        const gameState = {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            gameStarted: this.gameStarted,
            boardSpaces: this.boardSpaces,
            lastDiceRoll: this.lastDiceRoll,
            diceRolled: this.diceRolled
        };
        
        localStorage.setItem('monopoly-game', JSON.stringify(gameState));
    }

    loadGame() {
        const savedGame = localStorage.getItem('monopoly-game');
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            
            this.players = gameState.players;
            this.currentPlayerIndex = gameState.currentPlayerIndex;
            this.gameStarted = gameState.gameStarted;
            this.boardSpaces = gameState.boardSpaces;
            this.lastDiceRoll = gameState.lastDiceRoll;
            this.diceRolled = gameState.diceRolled;
            
            if (this.gameStarted) {
                this.closeModal();
                this.renderPlayerCards();
                this.updateCurrentPlayer();
                this.renderPlayerPieces();
                this.updateActionButtons();
                this.updatePlayerDisplay();
            }
        }
    }
}

// Initialize game when page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new MonopolyGame();
    
    // Try to load saved game
    game.loadGame();
    
    // Auto-save game state periodically
    setInterval(() => {
        if (game.gameStarted) {
            game.saveGame();
        }
    }, 10000); // Save every 10 seconds
    
    // Save game when page is closed
    window.addEventListener('beforeunload', () => {
        if (game.gameStarted) {
            game.saveGame();
        }
    });
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}