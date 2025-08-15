import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Message from './components/Message';
import { getNextWord, isValidWord, CUSTOM_WORDS } from './words';
import { 
  saveGameState, 
  loadGameState, 
  clearCurrentGame, 
  saveCompletedWord, 
  getCompletedWords, 
  getGameStats 
} from './gameStorage';

const GAME_STATUS = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

function App() {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);
  const [keyStates, setKeyStates] = useState({});
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved theme preference
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false; // Default to light mode
  });

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('darkMode', newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize or load game
  const initializeGame = useCallback(() => {
    const savedGame = loadGameState();

    if (savedGame && savedGame.gameStatus === GAME_STATUS.PLAYING) {
      // Resume saved game
      setTargetWord(savedGame.targetWord);
      setGuesses(savedGame.guesses);
      setCurrentGuess(savedGame.currentGuess);
      setCurrentRow(savedGame.currentRow);
      setGameStatus(savedGame.gameStatus);
      setKeyStates(savedGame.keyStates || {});
    } else {
      // Start new game
      startNewGame();
    }
  }, []);

  const startNewGame = () => {
    // Get the next word in sequence based on completed words count
    const newWord = getNextWord();

    setTargetWord(newWord);
    setGuesses([]);
    setCurrentGuess('');
    setCurrentRow(0);
    setGameStatus(GAME_STATUS.PLAYING);
    setKeyStates({});
    setMessage('');
    
    clearCurrentGame();
  };

  // Save game state whenever it changes
  useEffect(() => {
    if (targetWord && gameStatus === GAME_STATUS.PLAYING) {
      const gameState = {
        targetWord,
        guesses,
        currentGuess,
        currentRow,
        gameStatus,
        keyStates
      };
      saveGameState(gameState);
    }
  }, [targetWord, guesses, currentGuess, currentRow, gameStatus, keyStates]);

  const updateKeyStates = (guess, target) => {
    const newKeyStates = { ...keyStates };
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    const wordLength = target.length;
    
    // First pass: mark correct positions
    for (let i = 0; i < wordLength; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        newKeyStates[guessLetters[i]] = 'correct';
        targetLetters[i] = null;
      }
    }
    
    // Second pass: mark present letters (only if not already correct)
    for (let i = 0; i < wordLength; i++) {
      const letter = guessLetters[i];
      if (newKeyStates[letter] !== 'correct') {
        const letterIndex = targetLetters.indexOf(letter);
        if (letterIndex !== -1) {
          newKeyStates[letter] = 'present';
          targetLetters[letterIndex] = null;
        } else {
          newKeyStates[letter] = 'absent';
        }
      }
    }
    
    setKeyStates(newKeyStates);
  };

  const showMessage = (text, duration = 2000) => {
    setMessage(text);
    setTimeout(() => setMessage(''), duration);
  };

  const handleKeyPress = useCallback(async (key) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== targetWord.length) {
        showMessage(`Word must be ${targetWord.length} letters long`);
        return;
      }
      
      // Check if the word has already been guessed
      if (guesses.includes(currentGuess)) {
        showMessage('Already guessed this word');
        return;
      }
      
      const isValid = await isValidWord(currentGuess, targetWord.length);
      if (!isValid) {
        showMessage('Not a valid word');
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      // Update keyboard states with staggered timing
      setTimeout(() => {
        updateKeyStates(currentGuess, targetWord);
      }, 1500); // Wait for tile animations to complete

      if (currentGuess === targetWord) {
        setGameStatus(GAME_STATUS.WON);
        saveCompletedWord(targetWord, newGuesses.length);
        showMessage(`Congratulations! You got it in ${newGuesses.length} ${newGuesses.length === 1 ? 'try' : 'tries'}!`, 3000);
        clearCurrentGame();
      } else if (newGuesses.length >= 6) {
        setGameStatus(GAME_STATUS.LOST);
        showMessage(`Game over! The word was ${targetWord}`, 4000);
        clearCurrentGame();
      }

      setCurrentGuess('');
      setCurrentRow(currentRow + 1);
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < targetWord.length && key.match(/^[A-Z]$/)) {
      setCurrentGuess(currentGuess + key);
    }
  }, [gameStatus, currentGuess, currentRow, targetWord, guesses, keyStates]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (gameStatus !== GAME_STATUS.PLAYING) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        await handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACKSPACE');
      } else if (key.match(/^[A-Z]$/) && key.length === 1) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleKeyPress]);

  const handleNewWordClick = () => {
    startNewGame();
  };

  return (
    <div 
      className="game-container" 
      style={{'--word-length': targetWord.length}}
    >
      <header className="header">
        <h1 className="title">Chris and Katie's Wedding Wordle</h1>
      </header>

      <GameBoard
        guesses={guesses}
        currentGuess={currentGuess}
        targetWord={targetWord}
        currentRow={currentRow}
      />

      <Keyboard
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
      />

      {gameStatus !== GAME_STATUS.PLAYING && (
        <div className="game-complete">
          {gameStatus === GAME_STATUS.WON && (
            <p>🎉 Congratulations! You solved it! 🎉</p>
          )}
          {gameStatus === GAME_STATUS.LOST && (
            <p>😔 Better luck next time! The word was <strong>{targetWord}</strong></p>
          )}
          <button 
            className="new-word-button"
            onClick={handleNewWordClick}
          >
            Play New Word
          </button>
        </div>
      )}

      <Message message={message} onClose={() => setMessage('')} />
      
      <div className="theme-toggle-wrapper">
        <input 
          type="checkbox" 
          id="theme-toggle" 
          className="theme-toggle-input"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <label htmlFor="theme-toggle" className="theme-toggle-label">
          <span className="theme-toggle-slider"></span>
        </label>
      </div>
    </div>
  );
}

export default App;
