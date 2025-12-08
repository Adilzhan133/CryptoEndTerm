document.addEventListener("DOMContentLoaded", () => {
    let provider, signer, contract;
    let selectedGameId = null;

    const contractAddress = "0xe2595f001D0D9720E1aA9d4a93F09e28eaeC6954";
    const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "opponent",
				"type": "address"
			}
		],
		"name": "createGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "player1",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "player2",
				"type": "address"
			}
		],
		"name": "GameCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "result",
				"type": "string"
			}
		],
		"name": "GameFinished",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum RPSMultiplayer.Move",
				"name": "move",
				"type": "uint8"
			}
		],
		"name": "MoveSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "enum RPSMultiplayer.Move",
				"name": "move",
				"type": "uint8"
			}
		],
		"name": "submitMove",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "betAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "gameCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "games",
		"outputs": [
			{
				"internalType": "address",
				"name": "player1",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "player2",
				"type": "address"
			},
			{
				"internalType": "enum RPSMultiplayer.Move",
				"name": "move1",
				"type": "uint8"
			},
			{
				"internalType": "enum RPSMultiplayer.Move",
				"name": "move2",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "finished",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "result",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGame",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player1",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "player2",
						"type": "address"
					},
					{
						"internalType": "enum RPSMultiplayer.Move",
						"name": "move1",
						"type": "uint8"
					},
					{
						"internalType": "enum RPSMultiplayer.Move",
						"name": "move2",
						"type": "uint8"
					},
					{
						"internalType": "bool",
						"name": "finished",
						"type": "bool"
					},
					{
						"internalType": "string",
						"name": "result",
						"type": "string"
					}
				],
				"internalType": "struct RPSMultiplayer.Game",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerGames",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "playerGames",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

    const connectBtn = document.getElementById("connectBtn");
    const walletAddress = document.getElementById("walletAddress");
    const opponentInput = document.getElementById("opponentInput");
    const createGameBtn = document.getElementById("createGameBtn");
    const pendingGames_ul = document.getElementById("pendingGames");
    const gameHistory_ul = document.getElementById("gameHistory");

    const result_p = document.querySelector(".result > p");
    const playerScore_span = document.getElementById("player-score");
    const opponentScore_span = document.getElementById("opponent-score");

    const rock_div = document.getElementById("r");
    const paper_div = document.getElementById("p");
    const scissors_div = document.getElementById("s");

    let playerScore = 0, opponentScore = 0;

    // ---------------- Connect Wallet ----------------
    connectBtn.addEventListener("click", async () => {
        if(!window.ethereum) return alert("MetaMask not detected!");
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        walletAddress.innerText = `Connected: ${address}`;
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        loadPendingGames();
        loadGameHistory();
    });

    // ---------------- Create Game ----------------
    createGameBtn.addEventListener("click", async () => {
        if(!contract) return alert("Connect wallet first!");
        const opponent = opponentInput.value;
        if(!opponent) return alert("Enter opponent address!");
        try {
            const tx = await contract.createGame(opponent, { value: ethers.utils.parseEther("0.0001") });
            await tx.wait();
            alert("Game created!");
            loadPendingGames();
        } catch(err) { console.error(err); alert("Failed to create game"); }
    });

    // ---------------- Load Pending Games ----------------
    async function loadPendingGames() {
        if(!contract) return;
        const address = await signer.getAddress();
        const gameIds = await contract.getPlayerGames(address);
        pendingGames_ul.innerHTML = "";
        selectedGameId = null;
        for(let id of gameIds) {
            const game = await contract.getGame(id);
            const moveField = game.player1 === address ? "move1" : "move2";
            if(!game.finished && game[moveField] == 0) {
                const li = document.createElement("li");
                const opponent = game.player1 === address ? game.player2 : game.player1;
                li.innerHTML = `Game ${id} vs ${opponent} 
                    <button class="submitMoveBtn" onclick="selectGame(${id})">Select Game</button>`;
                pendingGames_ul.appendChild(li);
            }
        }
    }

    window.selectGame = (gameId) => {
        selectedGameId = gameId;
        result_p.innerText = `Selected game ${gameId}. Now click your move below.`;
    };

    // ---------------- Submit Move ----------------
    async function submitMove(choice) {
        if(!contract) return alert("Connect wallet first!");
        if(selectedGameId === null) return alert("Select a pending game first!");
        const moveMap = { "r":1, "p":2, "s":3 };
        try {
            const tx = await contract.submitMove(selectedGameId, moveMap[choice], { value: ethers.utils.parseEther("0.0001") });
            await tx.wait();
            result_p.innerText = `Move ${choice.toUpperCase()} submitted for game ${selectedGameId}`;
            selectedGameId = null;
            loadPendingGames();
            loadGameHistory();
        } catch(err) { console.error(err); alert("Failed to submit move"); }
    }

    rock_div.addEventListener("click", ()=>submitMove("r"));
    paper_div.addEventListener("click", ()=>submitMove("p"));
    scissors_div.addEventListener("click", ()=>submitMove("s"));

    // ---------------- Load Game History ----------------
    async function loadGameHistory() {
        if(!contract) return;
        const address = await signer.getAddress();
        const gameIds = await contract.getPlayerGames(address);
        gameHistory_ul.innerHTML = "";
        playerScore = 0; opponentScore = 0;

        for(let id of gameIds) {
            const game = await contract.getGame(id);
            if(game.finished) {
                const opponent = game.player1 === address ? game.player2 : game.player1;
                const yourMove = game.player1 === address ? game.move1 : game.move2;
                const opponentMove = game.player1 === address ? game.move2 : game.move1;

                let resultText = "";
                if(game.result==="draw") resultText="Draw";
                else if(game.result==="player1 wins") resultText = game.player1===address ? "You win" : "You lose";
                else if(game.result==="player2 wins") resultText = game.player2===address ? "You win" : "You lose";

                const li = document.createElement("li");
                li.textContent = `Game ${id} vs ${opponent}: You ${yourMove}, Opponent ${opponentMove}, Result: ${resultText}`;
                gameHistory_ul.appendChild(li);

                if(resultText==="You win") playerScore++;
                else if(resultText==="You lose") opponentScore++;
            }
        }
        playerScore_span.innerText = playerScore;
        opponentScore_span.innerText = opponentScore;
    }
});
