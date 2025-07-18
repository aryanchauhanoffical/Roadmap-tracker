# ⚔️ Road to the Throne: Career Roadmap Tracker

A medieval fantasy-themed goal-setting and milestone tracking app for tech learners, inspired by Game of Thrones.

## ✨ Features

- **Add, edit, and delete learning goals** (with title, description, and target date)
- **Milestones** for each goal (add, check off, remove)
- **Streaks**: Track your daily progress streak
- **Badges**: Earn badges for first goal, 3-day streak, and 5 milestones completed
- **Game of Thrones-inspired UI**: Medieval fonts, gold accents, shield/sword icons, parchment backgrounds
- **Animated UX**: Sword swing on button hover, shield flip on milestone toggle
- **Heroic modal intro**: Dramatic welcome popup with calligraphy and emblem
- **Responsive design**: Works on desktop and mobile

## 🖌️ Style & Theme

- **Fonts**: [Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative) for titles, [Merriweather](https://fonts.google.com/specimen/Merriweather) for body
- **Color Palette**:
  - Background: Parchment texture with radial gradient (light cream to gold/brown)
  - Text: Off-white and gold
  - Accents: Gold (#bfa145), Blood Red (#d32f2f)
  - Inputs: Matte dark (#222/#333), Borders: Steel (#666)
- **Icons**: Font Awesome (sword, shield, dagger)
- **Buttons**: Gold-edged, sword animation on hover
- **Milestones**: Shield checkboxes, dagger remove
- **Modal**: Parchment box, gold border, sword emblem, dramatic fade-in

## 🚀 Getting Started

1. **Clone or download this repo**
2. **Install dependencies**
   ```sh
   cd roadmap-tracker-app
   npm install
   ```
3. **Start the development server**
   ```sh
   npm run dev
   ```
4. **Open your browser** to the local URL shown in the terminal (usually http://localhost:5173)

## 🛠️ Tech Stack

- [SvelteKit](https://kit.svelte.dev/) (frontend framework)
- [Firebase](https://firebase.google.com/) (Firestore for data storage)
- [Font Awesome](https://fontawesome.com/) (icons)
- [Google Fonts](https://fonts.google.com/)

## 🧙‍♂️ Customization

- **Background/Emblem**: Swap the SVG or texture in the CSS for your own crest or pattern
- **Badges**: Add more badge logic in `+page.svelte`
- **Sound Effects**: (Optional) Add your own for actions

## 📜 License

This project is for educational and personal use. Parchment textures and icons are from public domain or open sources.

---

> "A goal without a plan is just a wish. Begin your quest and claim your destiny!"
