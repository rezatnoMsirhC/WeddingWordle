import React from 'react';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

function Keyboard({ onKeyPress, keyStates }) {
  const handleKeyClick = async (key) => {
    await onKeyPress(key);
  };

  const getKeyClass = (key) => {
    let className = 'key';
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      className += ' wide';
    } else {
      className += ' letter';
    }
    
    // Only add key state classes if keyStates exists, is not null, and has the key
    if (keyStates && typeof keyStates === 'object' && keyStates[key]) {
      className += ` ${keyStates[key]}`;
    }
    
    return className;
  };

  return (
    <div className="keyboard">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => handleKeyClick(key)}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
