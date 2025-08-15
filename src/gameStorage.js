// Game state management with localStorage persistence

const STORAGE_KEYS = {
  CURRENT_GAME: 'weddingWordle_currentGame',
  COMPLETED_WORDS: 'weddingWordle_completedWords',
  GAME_STATS: 'weddingWordle_gameStats'
};

export function saveGameState(gameState) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadGameState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function clearCurrentGame() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch (error) {
    console.error('Failed to clear current game:', error);
  }
}

export function saveCompletedWord(word, attempts, isWin = true) {
  try {
    let completedWords = getCompletedWords();
    if (!completedWords.includes(word)) {
      completedWords.push(word);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_WORDS, JSON.stringify(completedWords));
      
      // Update stats with win/loss information
      updateGameStats(attempts, isWin);
    }
  } catch (error) {
    console.error('Failed to save completed word:', error);
  }
}

export function getCompletedWords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_WORDS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load completed words:', error);
    return [];
  }
}

export function updateGameStats(attempts, isWin = true) {
  try {
    let stats = getGameStats();
    stats.totalGames++;
    if (isWin && attempts <= 6) {
      stats.totalWins++;
      stats.attemptsDistribution[attempts - 1]++;
    }
    stats.winPercentage = Math.round((stats.totalWins / stats.totalGames) * 100);
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update game stats:', error);
  }
}

export function getGameStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load game stats:', error);
  }
  
  // Default stats
  return {
    totalGames: 0,
    totalWins: 0,
    winPercentage: 0,
    attemptsDistribution: [0, 0, 0, 0, 0, 0] // attempts 1-6
  };
}

export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
}

export function clearCompletedWords() {
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_WORDS);
  } catch (error) {
    console.error('Failed to clear completed words:', error);
  }
}
