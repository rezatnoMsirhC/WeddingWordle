import React, { useState, useEffect } from 'react';

function GameBoard({ guesses, currentGuess, targetWord, currentRow }) {
  const [animatingRow, setAnimatingRow] = useState(-1);
  const wordLength = targetWord.length;

  // Trigger animation for the most recent guess
  useEffect(() => {
    if (guesses.length > 0) {
      setAnimatingRow(guesses.length - 1);
      // Reset animation state after animation completes
      setTimeout(() => {
        setAnimatingRow(-1);
      }, 600 + ((wordLength - 1) * 100)); // Animation duration + stagger delay
    }
  }, [guesses.length, wordLength]);

  const evaluateGuess = (guess, target) => {
    const result = [];
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    
    // First pass: mark correct positions
    for (let i = 0; i < wordLength; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = 'correct';
        targetLetters[i] = null; // Mark as used
      }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < wordLength; i++) {
      if (result[i] === undefined) {
        const letterIndex = targetLetters.indexOf(guessLetters[i]);
        if (letterIndex !== -1) {
          result[i] = 'present';
          targetLetters[letterIndex] = null; // Mark as used
        } else {
          result[i] = 'absent';
        }
      }
    }
    
    return result;
  };

  const renderTile = (rowIndex, colIndex) => {
    let letter = '';
    let tileClass = 'tile';
    
    if (rowIndex < guesses.length) {
      // Previous guesses
      letter = guesses[rowIndex][colIndex] || '';
      if (letter) {
        const evaluation = evaluateGuess(guesses[rowIndex], targetWord);
        tileClass += ` ${evaluation[colIndex]}`;
        
        // Add animation class for the most recent guess
        if (rowIndex === animatingRow) {
          tileClass += ' animate-flip';
        }
      }
    } else if (rowIndex === currentRow && colIndex < currentGuess.length) {
      // Current guess
      letter = currentGuess[colIndex];
      tileClass += ' filled';
    }
    
    return (
      <div 
        key={colIndex} 
        className={tileClass}
        style={{
          animationDelay: rowIndex === animatingRow ? `${colIndex * 0.1}s` : '0s'
        }}
      >
        {letter}
      </div>
    );
  };

  const renderRow = (rowIndex) => (
    <div key={rowIndex} className="row">
      {Array.from({ length: wordLength }, (_, colIndex) => renderTile(rowIndex, colIndex))}
    </div>
  );

  return (
    <div className="game-board">
      {Array.from({ length: 6 }, (_, rowIndex) => renderRow(rowIndex))}
    </div>
  );
}

export default GameBoard;
