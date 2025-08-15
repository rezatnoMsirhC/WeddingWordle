# Chris and Katie's Wedding Wordle

A custom Wordle game with personalized words of varying lengths, perfect for wedding celebrations or any special occasion!

## Features

- 🎯 **Custom Word List**: Play with a curated list of personalized words supporting variable lengths (5+ letters)
- 🌐 **API Word Validation**: All guesses are validated against the Free Dictionary API for real English words
- 💾 **Session Persistence**: Your progress is automatically saved - refresh the page without losing your current game
- 📊 **Statistics Tracking**: Keep track of games played and completion percentage
- 🎮 **Responsive Design**: Fully mobile-friendly with optimized touch controls
- 🌙 **Light/Dark Mode**: Toggle between light and dark themes with preference saving
- 🔄 **Sequential Gameplay**: Play through words in order with no repeats per session
- 🎨 **Wedding Theme**: Custom wedding font and elegant styling
- ⏰ **Staggered Animations**: Smooth tile reveal animations for better user experience

## How to Play

1. Guess the word in 6 attempts or less (words can be 5+ letters)
2. After each guess, the tiles will change color:
   - 🟩 **Green**: Letter is correct and in the right position
   - 🟨 **Yellow**: Letter is in the word but in the wrong position
   - ⬛ **Gray**: Letter is not in the word
3. Use the on-screen keyboard or your physical keyboard to enter guesses
4. All guesses must be valid English words (verified via Dictionary API)
5. Press Enter to submit your guess
6. Complete the word to move on to the next word in sequence!
7. Toggle between light/dark mode using the switch at the bottom of the page

## Customization

You can easily customize the word list by editing the `src/customWords.json` file. The file contains a single `words` array that supports:
- Words of varying lengths (5+ letters)
- Any custom words you want to include
- Sequential gameplay (words are played in order)

Example structure:
```json
{
  "words": [
    "BENNY",
    "FOODIES", 
    "ENGINEERS"
  ]
}
```

Simply add or remove words from the array to personalize the game for your event or preferences!

## Development

This project is built with:
- React 18 with Vite for fast development and building
- Free Dictionary API for word validation
- CSS Grid and Flexbox for responsive layouts
- CSS custom properties for theming
- Local Storage for game state persistence
- Custom Wedding font from DaFont
- GitHub Actions for automated deployment

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## Local Storage

The game uses browser localStorage to persist:
- Current game state (guesses, current word index, keyboard state)
- Completed words tracking (prevents replaying the same word)
- Game statistics (total games played, completion percentage)
- Theme preference (light/dark mode)
- Session progress through the word list

## Contributing

Feel free to customize the word list, styling, or add new features! This is designed to be easily adaptable for different occasions and preferences.

### Key Features to Note:
- Variable word lengths supported (just add words of any length 5+ to the JSON)
- API validation ensures all guesses are real English words
- Sequential word order prevents repeats within a session
- Mobile-responsive design with touch-friendly controls
- Light/dark theme toggle with emoji indicators

## Live Demo

Visit the live version at: `https://rezatnoMsirhC.github.io/WeddingWordle/`

---

Enjoy playing Chris and Katie's Wedding Wordle! 💍✨
