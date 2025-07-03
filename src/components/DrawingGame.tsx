import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Check, Copy, Pencil, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from '../utils/mockUuid';

interface Game {
  id: string;
  creatorId: string;
  creatorName: string;
  drawingData: string;
  answer: string;
  guesses: {
    userId: string;
    userName: string;
    guess: string;
    correct: boolean;
    timestamp: number;
  }[];
  timestamp: number;
  completed: boolean;
}

export const DrawingGame = () => {
  const { userProfile } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [answer, setAnswer] = useState('');
  const [guess, setGuess] = useState('');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushRadius, setBrushRadius] = useState(3);
  const [gameId, setGameId] = useState('');
  const canvasRef = useRef<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  useEffect(() => {
    // Check for game ID in URL
    const url = new URL(window.location.href);
    const gameIdParam = url.searchParams.get('gameId');
    
    if (gameIdParam) {
      setGameId(gameIdParam);
      setIsJoining(true);
    }
    
    // Load games from localStorage
    const storedGames = localStorage.getItem('mehfil-drawing-games');
    if (storedGames) {
      const parsedGames = JSON.parse(storedGames);
      setGames(parsedGames);
      
      // If joining a game, set it as active
      if (gameIdParam) {
        const foundGame = parsedGames.find((g: Game) => g.id === gameIdParam);
        if (foundGame) {
          setActiveGame(foundGame);
        }
      }
    }
  }, []);
  
  const saveGames = (updatedGames: Game[]) => {
    setGames(updatedGames);
    localStorage.setItem('mehfil-drawing-games', JSON.stringify(updatedGames));
  };
  
  const handleStartDrawing = () => {
    setIsDrawing(true);
    setActiveGame(null);
  };
  
  const handleSaveDrawing = () => {
    if (!userProfile || !canvasRef.current || !answer.trim()) {
      toast.error('Please provide an answer for your drawing');
      return;
    }
    
    const drawingData = canvasRef.current.getSaveData();
    const newGame: Game = {
      id: uuidv4(),
      creatorId: userProfile.id,
      creatorName: userProfile.preferredName,
      drawingData,
      answer: answer.trim().toLowerCase(),
      guesses: [],
      completed: false,
      timestamp: Date.now()
    };
    
    const updatedGames = [newGame, ...games];
    saveGames(updatedGames);
    
    // Generate shareable URL
    const shareableUrl = `${window.location.origin}/tasveer-bujho?gameId=${newGame.id}`;
    setShareUrl(shareableUrl);
    
    toast.success('Drawing saved! Share with friends to let them guess');
    setIsDrawing(false);
    setActiveGame(newGame);
  };
  
  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };
  
  const handleJoinGame = () => {
    if (!gameId.trim()) {
      toast.error('Please enter a game ID');
      return;
    }
    
    const foundGame = games.find(g => g.id === gameId);
    if (foundGame) {
      setActiveGame(foundGame);
      setIsJoining(false);
      
      // Update URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('gameId', gameId);
      window.history.pushState({}, '', url.toString());
    } else {
      toast.error('Game not found');
    }
  };
  
  const handleSubmitGuess = () => {
    if (!userProfile || !activeGame || !guess.trim()) {
      toast.error('Please enter your guess');
      return;
    }
    
    const isCorrect = guess.trim().toLowerCase() === activeGame.answer.toLowerCase();
    
    const newGuess = {
      userId: userProfile.id,
      userName: userProfile.preferredName,
      guess: guess.trim(),
      correct: isCorrect,
      timestamp: Date.now()
    };
    
    // Check if user already guessed
    const userAlreadyGuessed = activeGame.guesses.some(g => g.userId === userProfile.id);
    
    let updatedGuesses;
    if (userAlreadyGuessed) {
      updatedGuesses = activeGame.guesses.map(g => 
        g.userId === userProfile.id ? newGuess : g
      );
    } else {
      updatedGuesses = [...activeGame.guesses, newGuess];
    }
    
    const updatedGame = {
      ...activeGame,
      guesses: updatedGuesses,
      completed: isCorrect || activeGame.completed
    };
    
    const updatedGames = games.map(g => 
      g.id === activeGame.id ? updatedGame : g
    );
    
    saveGames(updatedGames);
    setActiveGame(updatedGame);
    setGuess('');
    
    if (isCorrect) {
      toast.success('Correct guess! Well done!');
    } else {
      toast.info('Keep trying!');
    }
  };
  
  const handleShareGame = () => {
    if (!activeGame) return;
    
    const shareableUrl = `${window.location.origin}/tasveer-bujho?gameId=${activeGame.id}`;
    setShareUrl(shareableUrl);
    
    // Open WhatsApp sharing
    const whatsappUrl = `https://wa.me/?text=Kya%20aap%20mera%20drawing%20guess%20kar%20sakte%20hain?%20${encodeURIComponent(shareableUrl)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleCopyLink = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success('Link copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800">Tasveer Bujho</h1>
        <p className="text-gray-500 text-sm">Draw karo, guess karo</p>
      </motion.div>
      
      {!isDrawing && !activeGame && !isJoining && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartDrawing}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Pencil size={18} />
              <span>Naya Drawing Banayein</span>
            </button>
            
            <button
              onClick={() => setIsJoining(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              <span>Game Join Karein</span>
            </button>
          </div>
          
          {games.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Purane Games</h2>
              <div className="space-y-4">
                {games.slice(0, 5).map(game => (
                  <div
                    key={game.id}
                    className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-amber-100"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {game.completed ? (
                            <span>"{game.answer}" <Check className="inline text-green-500" size={16} /></span>
                          ) : (
                            <span>Drawing Challenge</span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(game.timestamp).toLocaleDateString('hi-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveGame(game)}
                        className="text-xs px-2 py-1 text-amber-600 hover:text-amber-800 border border-amber-200 rounded-md hover:bg-amber-50"
                      >
                        {game.creatorId === userProfile?.id ? 'Dekho' : 'Guess Karo'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {isJoining && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-6"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-3">Game Join Karein</h2>
          <div className="mb-4">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Game ID yahan paste karein..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsJoining(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinGame}
              className="px-4 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all"
            >
              Join
            </button>
          </div>
        </motion.div>
      )}
      
      {isDrawing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-800">Naya Drawing</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleClearCanvas}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md overflow-hidden mb-3">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border border-gray-300 rounded-md bg-white"
                style={{ cursor: 'crosshair' }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button 
                onClick={() => setBrushColor('#000000')} 
                className={`w-6 h-6 rounded-full bg-black ${brushColor === '#000000' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
              />
              <button 
                onClick={() => setBrushColor('#ff0000')} 
                className={`w-6 h-6 rounded-full bg-red-600 ${brushColor === '#ff0000' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
              />
              <button 
                onClick={() => setBrushColor('#0000ff')} 
                className={`w-6 h-6 rounded-full bg-blue-600 ${brushColor === '#0000ff' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
              />
              <button 
                onClick={() => setBrushColor('#00ff00')} 
                className={`w-6 h-6 rounded-full bg-green-600 ${brushColor === '#00ff00' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
              />
              <button 
                onClick={() => setBrushColor('#ffff00')} 
                className={`w-6 h-6 rounded-full bg-yellow-400 ${brushColor === '#ffff00' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
              />
              <button 
                onClick={() => setBrushColor('#800080')} 
                className={`w-6 h-6 rounded-full bg-purple-600 ${brushColor === '#800080' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
              />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="brushSize" className="text-sm text-gray-600">Size:</label>
              <input
                type="range"
                id="brushSize"
                min="1"
                max="10"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                className="accent-amber-500"
              />
              <span className="text-sm text-gray-600">{brushRadius}</span>
            </div>
            
            <div className="mb-4">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                Yeh kya hai? (Answer)
              </label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Answer likhen..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDrawing(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDrawing}
                className="px-4 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all"
              >
                Save & Share
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeGame && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-800">
                {activeGame.creatorId === userProfile?.id ? 'Aapka Drawing' : 'Guess Karo'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleShareGame}
                  className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-full"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md overflow-hidden mb-3">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border border-gray-300 rounded-md bg-white"
                style={{ cursor: 'crosshair' }}
              />
            </div>
            
            {shareUrl && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md mb-3 text-sm">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-grow bg-transparent border-none outline-none text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-1 text-amber-600 hover:text-amber-800"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}
            
            {/* Show answer only to creator or if the game is completed */}
            {(activeGame.creatorId === userProfile?.id || activeGame.completed) && (
              <div className="p-3 bg-gradient-to-r from-amber-100 to-rose-100 rounded-md mb-3">
                <p className="text-gray-800 font-medium">
                  Answer: <span className="text-rose-600">{activeGame.answer}</span>
                </p>
              </div>
            )}
            
            {/* Allow guessing only for non-creators and if game is not completed */}
            {activeGame.creatorId !== userProfile?.id && !activeGame.completed && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Aapka guess..."
                  />
                  <button
                    onClick={handleSubmitGuess}
                    disabled={!guess.trim()}
                    className={`px-4 py-2 rounded-md ${
                      guess.trim() 
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
            
            {activeGame.guesses.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Guesses:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeGame.guesses.map((g, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-md text-sm ${
                        g.correct 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{g.userName}: "{g.guess}"</span>
                        {g.correct && <Check size={16} className="text-green-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setActiveGame(null);
                  setShareUrl('');
                  
                  // Remove gameId from URL
                  const url = new URL(window.location.href);
                  url.searchParams.delete('gameId');
                  window.history.pushState({}, '', url.toString());
                }}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DrawingGame;
