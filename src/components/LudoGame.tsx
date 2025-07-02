import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useHeartbeat } from '../context/HeartbeatContext';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw, Users } from 'lucide-react';

// Define player colors
const PLAYER_COLORS = {
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500"
};

// Define player paths
const PATHS = {
  red: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
  green: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  yellow: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  blue: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38]
};

// Define home spots
const HOME_SPOTS = {
  red: [52, 53, 54, 55],
  green: [56, 57, 58, 59],
  yellow: [60, 61, 62, 63],
  blue: [64, 65, 66, 67]
};

// Define start positions
const START_POSITIONS = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

type Player = {
  color: 'red' | 'green' | 'yellow' | 'blue';
  pieces: number[];
  name: string;
};

type GameState = {
  players: Player[];
  currentTurn: number;
  diceValue: number;
  diceRolling: boolean;
  winner: string | null;
  gameStarted: boolean;
};

export const LudoGame = () => {
  const { user } = useAuth();
  const { activeUsers } = useHeartbeat();
  
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { color: 'red', pieces: [-1, -1, -1, -1], name: 'Player 1' },
      { color: 'green', pieces: [-1, -1, -1, -1], name: 'Player 2' },
      { color: 'yellow', pieces: [-1, -1, -1, -1], name: 'Player 3' },
      { color: 'blue', pieces: [-1, -1, -1, -1], name: 'Player 4' }
    ],
    currentTurn: 0,
    diceValue: 6,
    diceRolling: false,
    winner: null,
    gameStarted: false
  });
  
  const [showRules, setShowRules] = useState(false);
  const [localPlayerIndex, setLocalPlayerIndex] = useState<number | null>(null);
  
  useEffect(() => {
    // In a real app, we would connect to a WebSocket here
    // For this demo, we'll just simulate online players
    const playerNames = ['Arif', 'Zainab', 'Imran', 'Sana'];
    
    if (user) {
      // Assign this user to the first player
      setLocalPlayerIndex(0);
      
      // Update player names
      setGameState(prev => ({
        ...prev,
        players: prev.players.map((player, index) => ({
          ...player,
          name: index === 0 ? user.name : playerNames[index]
        }))
      }));
    }
  }, [user]);
  
  const rollDice = () => {
    if (gameState.diceRolling || gameState.winner) return;
    
    // Check if it's player's turn
    if (localPlayerIndex !== gameState.currentTurn) {
      alert('Abhi aapki baari nahi hai!');
      return;
    }
    
    setGameState(prev => ({ ...prev, diceRolling: true }));
    
    // Simulate dice rolling
    const rollInterval = setInterval(() => {
      setGameState(prev => ({ ...prev, diceValue: Math.floor(Math.random() * 6) + 1 }));
    }, 100);
    
    // Stop rolling after 1 second
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      
      setGameState(prev => {
        // Start game if not started yet
        if (!prev.gameStarted) {
          return {
            ...prev,
            diceRolling: false,
            diceValue: finalValue,
            gameStarted: finalValue === 6
          };
        }
        
        // Otherwise, continue normal turn
        const currentPlayer = prev.players[prev.currentTurn];
        const canMove = currentPlayer.pieces.some(pos => pos >= 0 || finalValue === 6);
        
        // If player can't move, move to next turn
        const nextTurn = !canMove || finalValue === 6 
          ? prev.currentTurn 
          : (prev.currentTurn + 1) % prev.players.length;
        
        return {
          ...prev,
          diceRolling: false,
          diceValue: finalValue,
          currentTurn: nextTurn
        };
      });
    }, 1000);
  };
  
  const movePiece = (playerIndex: number, pieceIndex: number) => {
    if (gameState.diceRolling || gameState.winner) return;
    if (playerIndex !== gameState.currentTurn) return;
    if (localPlayerIndex !== playerIndex) return;
    
    setGameState(prev => {
      const player = prev.players[playerIndex];
      const currentPos = player.pieces[pieceIndex];
      
      // If piece is in home (-1) and dice is not 6, can't move
      if (currentPos === -1 && prev.diceValue !== 6) {
        return prev;
      }
      
      // If piece is in home and dice is 6, move to start
      if (currentPos === -1 && prev.diceValue === 6) {
        const newPlayers = [...prev.players];
        newPlayers[playerIndex].pieces[pieceIndex] = START_POSITIONS[player.color as keyof typeof START_POSITIONS];
        
        return {
          ...prev,
          players: newPlayers,
          currentTurn: (prev.currentTurn + 1) % prev.players.length
        };
      }
      
      // Move piece along path
      const path = PATHS[player.color as keyof typeof PATHS];
      const currentPathIndex = path.indexOf(currentPos);
      const newPathIndex = currentPathIndex + prev.diceValue;
      
      // If path complete, move to home spots
      if (newPathIndex >= path.length) {
        const newPlayers = [...prev.players];
        const homeIndex = pieceIndex % HOME_SPOTS[player.color as keyof typeof HOME_SPOTS].length;
        newPlayers[playerIndex].pieces[pieceIndex] = HOME_SPOTS[player.color as keyof typeof HOME_SPOTS][homeIndex];
        
        // Check if player has won (all pieces in home)
        const hasWon = newPlayers[playerIndex].pieces.every(pos => 
          HOME_SPOTS[player.color as keyof typeof HOME_SPOTS].includes(pos)
        );
        
        return {
          ...prev,
          players: newPlayers,
          currentTurn: (prev.currentTurn + 1) % prev.players.length,
          winner: hasWon ? player.name : null
        };
      }
      
      // Regular move
      const newPos = path[newPathIndex];
      const newPlayers = [...prev.players];
      newPlayers[playerIndex].pieces[pieceIndex] = newPos;
      
      // Check if piece captures another player's piece
      for (let i = 0; i < prev.players.length; i++) {
        if (i === playerIndex) continue; // Skip current player
        
        const otherPlayer = prev.players[i];
        for (let j = 0; j < otherPlayer.pieces.length; j++) {
          if (otherPlayer.pieces[j] === newPos) {
            // Capture! Send piece back home
            newPlayers[i].pieces[j] = -1;
            break;
          }
        }
      }
      
      return {
        ...prev,
        players: newPlayers,
        currentTurn: (prev.currentTurn + 1) % prev.players.length
      };
    });
  };
  
  const renderDice = () => {
    const DiceIcon = () => {
      switch (gameState.diceValue) {
        case 1: return <Dice1 size={32} />;
        case 2: return <Dice2 size={32} />;
        case 3: return <Dice3 size={32} />;
        case 4: return <Dice4 size={32} />;
        case 5: return <Dice5 size={32} />;
        case 6: return <Dice6 size={32} />;
        default: return <Dice1 size={32} />;
      }
    };
    
    return (
      <motion.button
        onClick={rollDice}
        className={`p-4 rounded-lg ${gameState.diceRolling ? 'bg-amber-100' : 'bg-white'} shadow-md`}
        whileTap={{ scale: 0.95 }}
        animate={gameState.diceRolling ? { rotate: [0, 90, 180, 270, 360] } : {}}
        transition={{ duration: 0.5, repeat: gameState.diceRolling ? Infinity : 0 }}
        disabled={gameState.diceRolling || localPlayerIndex !== gameState.currentTurn}
      >
        <DiceIcon />
      </motion.button>
    );
  };
  
  const resetGame = () => {
    setGameState({
      players: [
        { color: 'red', pieces: [-1, -1, -1, -1], name: user?.name || 'Player 1' },
        { color: 'green', pieces: [-1, -1, -1, -1], name: 'Player 2' },
        { color: 'yellow', pieces: [-1, -1, -1, -1], name: 'Player 3' },
        { color: 'blue', pieces: [-1, -1, -1, -1], name: 'Player 4' }
      ],
      currentTurn: 0,
      diceValue: 6,
      diceRolling: false,
      winner: null,
      gameStarted: false
    });
  };
  
  // This is a simplified Ludo board representation
  // In a real app, this would be much more sophisticated
  const renderBoard = () => {
    // Create board cells (simplified for this example)
    const cells = Array(68).fill(0).map((_, index) => {
      // Determine cell color based on index
      let cellColor = "bg-gray-100";
      if ([0, 13, 26, 39].includes(index)) cellColor = "bg-gray-300"; // Start positions
      
      // Home cells
      if (index >= 52 && index <= 55) cellColor = "bg-red-200";
      if (index >= 56 && index <= 59) cellColor = "bg-green-200";
      if (index >= 60 && index <= 63) cellColor = "bg-yellow-200";
      if (index >= 64 && index <= 67) cellColor = "bg-blue-200";
      
      // Find pieces on this cell
      const pieces: { playerIndex: number; pieceIndex: number; color: string }[] = [];
      
      gameState.players.forEach((player, playerIndex) => {
        player.pieces.forEach((piecePos, pieceIndex) => {
          if (piecePos === index) {
            pieces.push({
              playerIndex,
              pieceIndex,
              color: PLAYER_COLORS[player.color as keyof typeof PLAYER_COLORS]
            });
          }
        });
      });
      
      return (
        <div 
          key={index} 
          className={`w-6 h-6 ${cellColor} border border-gray-300 flex items-center justify-center relative`}
        >
          {pieces.length > 0 && (
            <div className="flex flex-wrap items-center justify-center">
              {pieces.map((piece, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${piece.color} border border-white cursor-pointer`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => movePiece(piece.playerIndex, piece.pieceIndex)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ))}
            </div>
          )}
        </div>
      );
    });
    
    // Render player homes (where pieces start)
    const renderHome = (playerIndex: number) => {
      const player = gameState.players[playerIndex];
      const homePositions = Array(4).fill(0);
      
      return (
        <div className={`grid grid-cols-2 gap-1 p-2 rounded-lg ${playerIndex === gameState.currentTurn ? 'ring-2 ring-amber-400' : ''}`}>
          {homePositions.map((_, i) => {
            // Piece is in home if value is -1
            const pieceInHome = player.pieces.includes(-1) && player.pieces.indexOf(-1) === i;
            
            return (
              <motion.div
                key={i}
                className={`w-5 h-5 rounded-full border ${pieceInHome ? PLAYER_COLORS[player.color as keyof typeof PLAYER_COLORS] : 'bg-gray-100'} 
                  ${(pieceInHome && playerIndex === gameState.currentTurn && gameState.diceValue === 6) ? 'cursor-pointer' : ''}`}
                whileHover={pieceInHome && playerIndex === gameState.currentTurn && gameState.diceValue === 6 ? { scale: 1.2 } : {}}
                onClick={() => {
                  if (pieceInHome && playerIndex === gameState.currentTurn && gameState.diceValue === 6) {
                    movePiece(playerIndex, i);
                  }
                }}
              />
            );
          })}
        </div>
      );
    };
    
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-4">
          {renderHome(0)}
          <div className="grid grid-cols-13 grid-rows-13 gap-0">
            {cells}
          </div>
          {renderHome(1)}
        </div>
        
        <div className="flex items-center">
          {renderHome(3)}
          <div className="w-20"></div>
          {renderHome(2)}
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800">Ludo</h1>
        <p className="text-gray-500 text-sm">Cousins ki pasandida khel</p>
      </motion.div>
      
      {/* Active Players */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3 mb-4 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users size={18} className="text-gray-500 mr-2" />
            <p className="text-sm text-gray-700">
              {activeUsers} log online hain
            </p>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full"
          >
            <RefreshCw size={12} className="mr-1" />
            <span>Naya khel</span>
          </button>
        </div>
      </motion.div>
      
      {/* Game Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-medium text-gray-800">
              {gameState.winner 
                ? `${gameState.winner} jeet gaye!` 
                : `${gameState.players[gameState.currentTurn].name} ki baari`}
            </h2>
            {!gameState.gameStarted && (
              <p className="text-sm text-amber-600">Khel shuru karne ke liye 6 lane ki zaroorat hai</p>
            )}
          </div>
          {renderDice()}
        </div>
        
        {/* Player Status */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {gameState.players.map((player, index) => (
            <div 
              key={index}
              className={`p-2 rounded-md ${index === gameState.currentTurn ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${PLAYER_COLORS[player.color as keyof typeof PLAYER_COLORS]} mr-2`} />
                <p className="text-sm">{player.name}</p>
                {index === localPlayerIndex && (
                  <span className="text-xs bg-amber-100 px-1 rounded ml-2">Aap</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {player.pieces.filter(p => p === -1).length} ghar pe, {' '}
                {player.pieces.filter(p => p >= 0 && p < 52).length} board pe, {' '}
                {player.pieces.filter(p => p >= 52).length} finish
              </div>
            </div>
          ))}
        </div>
        
        {/* Simplified Board */}
        <div className="overflow-x-auto">
          <div className="min-w-[300px] flex justify-center">
            {renderBoard()}
          </div>
        </div>
      </div>
      
      {/* Rules */}
      <div className="mb-6">
        <button
          onClick={() => setShowRules(!showRules)}
          className="text-amber-600 text-sm hover:text-amber-800 mb-2"
        >
          {showRules ? 'Niyam chupao' : 'Khel ke niyam dikhao'}
        </button>
        
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-amber-100"
          >
            <h3 className="font-medium text-gray-800 mb-2">Ludo ke niyam:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Khel shuru karne ke liye 6 lane ki zaroorat hai</li>
              <li>Goti ko ghar se nikalne ke liye 6 lana zaroori hai</li>
              <li>Doosre khiladi ki goti ko kaatne par aapko dobara chance milta hai</li>
              <li>6 lane par aapko dobara chance milta hai</li>
              <li>Sabse pehle apni sari gotiya ghar pahunchane wala khiladi jeet jata hai</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LudoGame;
