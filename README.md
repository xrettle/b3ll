# Aesthetic Bell Timer

A premium, visually stunning bell timer application built for Egan Junior High School. This application features real-time countdowns, dynamic progress bars, and a beautiful UI that adapts to your preferences.

![Bell Timer Screenshot](https://via.placeholder.com/800x450?text=Aesthetic+Bell+Timer+Preview)

## Features

- **Real-Time Countdown**: Precision timer showing exact time remaining in the current period.
- **Dynamic Schedules**: Automatically loads the correct schedule for the day:
  - Regular Days (Mon, Tue, Fri)
  - Block Days (Wed, Thu)
  - Assembly Schedules (with customizable period mapping)
  - Minimum Days
- **Visual Progress Bar**: Sleek progress bar visualizing the period duration.
- **Theme Support**: 
  - **Dark Mode**: Deep, immersive dark theme with glassmorphism effects.
  - **Light Mode**: Clean, airy light theme for bright environments.
- **Responsive Design**: Flawless experience on desktop, tablet, and mobile.
- **Smart Detection**:
  - Automatically identifies current period vs. passing period.
  - Handles "Free" time and after-school hours.
- **Serialization**: Remembers your preferred schedule and theme settings across sessions.
- **Secret Features**: hehe

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Fira Code](https://github.com/tonsky/FiraCode) (Monospaced for timer precision)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xrettle/b3ll.git
   cd b3ll
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Shortcuts & Customization

- **Change Schedule**: Click the schedule name or clock icon in the top right.
- **Toggle Theme**: Use the Settings panel (Top Right > Settings) to switch between Light/Dark modes.
- **Custom Redirects**: Set a "Panic Button" redirect in settings for quick navigation away from the page using a custom keybind.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

*Designed for Egan Junior High.*
