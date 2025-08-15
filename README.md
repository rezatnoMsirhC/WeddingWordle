# Wedding Wordle

A custom Wordle game with personalized 5-letter words, perfect for wedding celebrations or any special occasion!

## Features

- 🎯 **Custom Word List**: Play with a curated list of wedding-themed and general 5-letter words
- 💾 **Session Persistence**: Your progress is automatically saved - refresh the page without losing your current game
- 📊 **Statistics Tracking**: Keep track of completed words, games played, and win percentage
- 🎮 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Endless Gameplay**: Continue playing with new random words after completing each puzzle

## How to Play

1. Guess the 5-letter word in 6 attempts or less
2. After each guess, the tiles will change color:
   - 🟩 **Green**: Letter is correct and in the right position
   - 🟨 **Yellow**: Letter is in the word but in the wrong position
   - ⬛ **Gray**: Letter is not in the word
3. Use the on-screen keyboard or your physical keyboard to enter guesses
4. Press Enter to submit your guess
5. Complete the word to move on to a new random word!

## Customization

You can easily customize the word list by editing the `src/customWords.json` file. The file contains two categories:
- `weddingWords`: Wedding-themed 5-letter words
- `generalWords`: General 5-letter words

Simply add or remove words from these arrays to personalize the game for your event or preferences!

## Development

This project is built with:
- React 18
- Vite
- Local Storage for persistence
- GitHub Actions for deployment

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## Local Storage

The game uses browser localStorage to persist:
- Current game state (guesses, current word, keyboard state)
- Completed words list
- Game statistics (total games, wins, win percentage)

## Contributing

Feel free to customize the word list, styling, or add new features! This is designed to be easily adaptable for different occasions and preferences.

---

Enjoy playing Wedding Wordle! 💍✨
