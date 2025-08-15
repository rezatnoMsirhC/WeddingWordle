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
  getGameStats,
  clearCompletedWords
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
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [showLossOverlay, setShowLossOverlay] = useState(false);
  const [keyboardKey, setKeyboardKey] = useState(0); // Force keyboard re-render
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

    if (savedGame && savedGame.gameStatus === GAME_STATUS.PLAYING && savedGame.currentRow > 0) {
      // Only resume saved game if there are actual guesses in progress
      setTargetWord(savedGame.targetWord);
      setGuesses(savedGame.guesses);
      setCurrentGuess(savedGame.currentGuess);
      setCurrentRow(savedGame.currentRow);
      setGameStatus(savedGame.gameStatus);
      
      // Always start with clean keyboard states, even when loading a saved game
      // Re-calculate keyboard states based on current guesses instead of loading from storage
      setKeyStates({});
      
      // Re-apply keyboard states based on current guesses
      if (savedGame.guesses && savedGame.guesses.length > 0) {
        const newKeyStates = {};
        savedGame.guesses.forEach(guess => {
          const guessLetters = guess.split('');
          const targetLetters = savedGame.targetWord.split('');
          const wordLength = savedGame.targetWord.length;
          
          // First pass: mark correct positions
          for (let i = 0; i < wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
              newKeyStates[guessLetters[i]] = 'correct';
              targetLetters[i] = null;
            }
          }
          
          // Second pass: mark present but wrong position
          for (let i = 0; i < wordLength; i++) {
            if (guessLetters[i] !== null && targetLetters.includes(guessLetters[i])) {
              if (!newKeyStates[guessLetters[i]] || newKeyStates[guessLetters[i]] !== 'correct') {
                newKeyStates[guessLetters[i]] = 'present';
              }
              targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
            }
          }
          
          // Third pass: mark absent letters
          for (let i = 0; i < wordLength; i++) {
            if (!newKeyStates[guessLetters[i]]) {
              newKeyStates[guessLetters[i]] = 'absent';
            }
          }
        });
        setKeyStates(newKeyStates);
      }
    } else {
      // Start new game (always reset keyboard states)
      startNewGame();
    }
  }, []);

  const startNewGame = () => {
    // Get the next word in sequence based on completed words count
    const newWord = getNextWord();
    
    // Clear any cached keyboard states
    clearCurrentGame();
    
    setTargetWord(newWord);
    setGuesses([]);
    setCurrentGuess('');
    setCurrentRow(0);
    setGameStatus(GAME_STATUS.PLAYING);
    setKeyStates({}); // Start with clean keyboard state
    setMessage('');
    setKeyboardKey(prev => prev + 1); // Force keyboard component re-render
  };

  // Save game state whenever it changes (but not when game is complete, and don't save keyboard states)
  useEffect(() => {
    if (targetWord && gameStatus === GAME_STATUS.PLAYING) {
      const gameState = {
        targetWord,
        guesses,
        currentGuess,
        currentRow,
        gameStatus
        // Don't save keyStates - we'll recalculate them when loading
      };
      saveGameState(gameState);
    }
  }, [targetWord, guesses, currentGuess, currentRow, gameStatus]);

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
      const keyboardUpdatePromise = new Promise((resolve) => {
        setTimeout(() => {
          updateKeyStates(currentGuess, targetWord);
          resolve();
        }, 1500); // Wait for tile animations to complete
      });

      if (currentGuess === targetWord) {
        // Don't change game status immediately to avoid showing the bottom button
        saveCompletedWord(targetWord, newGuesses.length, true); // true = win
        
        // Wait for keyboard update to complete before showing overlay and changing status
        keyboardUpdatePromise.then(() => {
          setGameStatus(GAME_STATUS.WON);
          setShowWinOverlay(true);
          // Clear game state after keyboard highlighting is complete
          setTimeout(() => {
            clearCurrentGame();
          }, 100);
        });
      } else if (newGuesses.length >= 6) {
        // Don't change game status immediately to avoid showing the bottom button
        // Save the word as completed even though it was lost, so we can advance to the next word
        saveCompletedWord(targetWord, newGuesses.length, false); // false = loss
        
        // Wait for keyboard update before showing overlay and changing status
        keyboardUpdatePromise.then(() => {
          setGameStatus(GAME_STATUS.LOST);
          setShowLossOverlay(true);
          // Clear game state after keyboard highlighting is complete
          setTimeout(() => {
            clearCurrentGame();
          }, 100);
        });
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
    setShowWinOverlay(false);
    setShowLossOverlay(false);
    
    // If this is the last word, clear completed words to start from beginning
    if (isLastWord()) {
      clearCompletedWords();
    }
    
    // Completely clear keyboard states - set to null first, then empty object
    setKeyStates(null);
    setKeyboardKey(prev => prev + 1); // Force keyboard re-render
    
    // Use setTimeout to ensure the null state is applied before setting empty object
    setTimeout(() => {
      setKeyStates({});
      startNewGame();
    }, 50); // Increased timeout to ensure clean reset
  };

  // Check if this is the last word in the sequence
  const isLastWord = () => {
    const currentWordIndex = CUSTOM_WORDS.indexOf(targetWord);
    return currentWordIndex === CUSTOM_WORDS.length - 1;
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
        key={keyboardKey}
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
      />

      {showWinOverlay && (
        <div className="overlay">
          <div className="win-modal">
            <div className="win-content">
              <h2>🎉 Congratulations! 🎉</h2>
              <p>You solved it in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}!</p>
              <button 
                className="continue-button"
                onClick={handleNewWordClick}
              >
                {isLastWord() ? "Start From The Beginning" : "Play Next Word"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLossOverlay && (
        <div className="overlay">
          <div className="win-modal">
            <div className="win-content">
              <h2>😔 Game Over 😔</h2>
              <p>Better luck next time!</p>
              <p>The word was <strong>{targetWord}</strong></p>
              <button 
                className="continue-button"
                onClick={handleNewWordClick}
              >
                {isLastWord() ? "Start From The Beginning" : "Play Next Word"}
              </button>
            </div>
          </div>
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
