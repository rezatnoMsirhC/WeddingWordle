// Import custom word list from JSON file
import customWordsData from './customWords.json';

// Use the words array directly
export const CUSTOM_WORDS = customWordsData.words;

// Helper function to get the next word in sequence based on completed words count
export function getNextWord() {
  // Get completed words from localStorage to determine which word to show next
  const completedWords = JSON.parse(localStorage.getItem('weddingWordle_completedWords') || '[]');
  const currentIndex = completedWords.length;
  
  // If we've completed all words, start over or handle as needed
  if (currentIndex >= CUSTOM_WORDS.length) {
    return CUSTOM_WORDS[0]; // Start over from the beginning
  }
  
  return CUSTOM_WORDS[currentIndex];
}

// Helper function to get a random word (kept for backward compatibility if needed)
export function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * CUSTOM_WORDS.length);
  return CUSTOM_WORDS[randomIndex];
}

// Helper function to check if a word is valid using an online dictionary API
export async function isValidWord(word, targetWordLength) {
  const wordToCheck = word.toLowerCase();
  
  // First check if it matches the target word length
  if (wordToCheck.length !== targetWordLength) {
    return false;
  }
  
  try {
    // Use the Free Dictionary API to validate the word
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToCheck}`);
    
    if (response.ok) {
      const data = await response.json();
      // If we get a valid response with data, the word exists in the dictionary
      return Array.isArray(data) && data.length > 0;
    } else if (response.status === 404) {
      // 404 means word not found in dictionary
      return false;
    } else {
      // For other errors (network issues, etc.), fall back to a basic word list check
      console.warn('Dictionary API error, falling back to basic validation');
      return isBasicValidWord(wordToCheck, targetWordLength);
    }
  } catch (error) {
    console.warn('Dictionary API error, falling back to basic validation:', error);
    // Fallback to basic validation in case of network issues
    return isBasicValidWord(wordToCheck, targetWordLength);
  }
}

// Fallback function for basic word validation when API is unavailable
function isBasicValidWord(word, targetWordLength) {
  const upperWord = word.toUpperCase();
  
  // Check if it contains only letters and matches target length
  const letterPattern = new RegExp(`^[A-Z]{${targetWordLength}}$`);
  if (!letterPattern.test(upperWord)) {
    return false;
  }
  
  // Basic check against our custom word list as fallback
  return CUSTOM_WORDS.includes(upperWord);
}
