# Valentine's Day App 💕

A romantic and interactive Valentine's Day application built with Next.js. This app creates a personalized experience for couples with animated hearts, dynamic responses, and a playful "Will you be my Valentine?" theme.

## Features ✨

- **Personalized Experience**: Enter your name to create a custom Valentine's journey
- **Animated Hearts**: Beautiful floating heart animations throughout the app
- **Interactive "No" Button**: A clever button that avoids being clicked with multiple evasion strategies
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Dynamic Content**: Personalized messages and reactions based on user interactions

## Tech Stack 🛠️

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **CSS-in-JS** - Inline styles for dynamic styling
- **React Hooks** - State management and side effects

## Getting Started 🚀

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/valentinesday.git
cd valentinesday
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure 📁

```
valentinesday/
├── app/
│   ├── [name]/
│   │   ├── page.js          # Main Valentine's question page
│   │   ├── yes/
│   │   │   └── page.js      # Success page
│   │   └── no/              # Directory for "no" responses
│   ├── layout.js            # Root layout
│   └── page.js              # Home/landing page
├── .gitignore               # Git ignore file
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## How It Works 💡

1. **Home Page**: Users enter their name to begin the experience
2. **Question Page**: The main "Will you be my Valentine?" screen with:
   - Floating heart animations
   - A "Yes" button that leads to a success page
   - A "No" button with multiple evasion strategies:
     - Moves away when hovered
     - Changes position randomly
     - Displays different messages
3. **Success Page**: Celebratory page for those who say "Yes!"

## Customization 🎨

You can easily customize:
- Colors and themes in the inline styles
- Messages and text content
- Animation speeds and effects
- Button behaviors and responses

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ for Valentine's Day
