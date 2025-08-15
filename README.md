# 🕌 Seerah Atlas - Islamic Historical Timeline

An interactive historical timeline and map showcasing the life of Prophet Muhammad (ﷺ) and key events in early Islamic history.

## ✨ Features

### 🗺️ Interactive Map
- **Leaflet-powered interactive map** with historical event markers
- **Dynamic event visualization** with location-based navigation
- **Zoom and pan** functionality for detailed exploration

### 📱 Mobile-Responsive Design
- **Adaptive timeline** that works seamlessly on mobile and desktop
- **Touch-friendly controls** optimized for mobile interaction
- **Responsive layout** with conditional UI elements

### 🌐 Multi-Language Support
- **Turkish (Türkçe)** - Primary language
- **Arabic (العربية)** - Original language context
- **English** - International accessibility
- **Dynamic language switching** with full translation support

### ⚡ Advanced Timeline Features
- **32 historical events** spanning from 570 CE to 1453 CE
- **Chronological playback** with adjustable speed controls
- **Event synchronization** between map markers and timeline
- **Detailed event modals** with rich historical information

### 🎨 Beautiful UI/UX
- **Islamic-themed design** with amber/gold color scheme
- **Smooth animations** and transitions
- **Islamic geometric patterns** and calligraphy elements
- **Dark theme** optimized for readability

## 🛠️ Technology Stack

- **Framework**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS with custom Islamic themes
- **Map**: Leaflet with custom markers and interactions
- **Components**: Radix UI primitives with shadcn/ui
- **Language**: TypeScript for type safety
- **Build Tool**: Modern build pipeline with optimization

## 📋 Historical Events Covered

The timeline includes key events from Islamic history:

- **Early Life (570-610 CE)**: Birth, childhood, and early experiences
- **Revelation Period (610-622 CE)**: First revelation and early Islamic message
- **Hijra & Medina (622-632 CE)**: Migration and establishment of Islamic state
- **Rashidun Caliphate (632-661 CE)**: First four Caliphs
- **Umayyad Period (661-750 CE)**: Expansion and golden age
- **Abbasid Era (750-1258 CE)**: Cultural and scientific flourishing
- **Ottoman Rise (1299-1453 CE)**: Turkish Islamic empire establishment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seerahatlas-app.git
   cd seerahatlas-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
seerahatlas-app/
├── app/                    # Next.js App Router
│   ├── about/             # About page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── historical-map.tsx # Main map component
│   └── language-selector.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── events.ts         # Event data management
│   ├── translations.ts   # i18n support
│   └── utils.ts         # Helper functions
├── public/               # Static assets
│   ├── events*.json     # Historical event data
│   └── images/          # Event images and icons
└── styles/              # Additional stylesheets
```

## 🎯 Key Features in Detail

### Timeline Synchronization
- **Bidirectional sync** between map markers and timeline controls
- **Event state management** ensuring consistent UI updates
- **Smart navigation** preventing modal desync issues

### Mobile Optimization
- **Responsive timeline** with adaptive button sizes
- **Touch-optimized controls** for mobile devices
- **Conditional feature display** (speed controls hidden on mobile)
- **Compact layouts** preserving functionality on small screens

### Historical Accuracy
- **Researched event data** with authentic dates and locations
- **Multiple source verification** for historical accuracy
- **Cultural sensitivity** in presentation and language
- **Academic references** for further study

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Areas for Contribution
- Additional historical events and data
- New language translations
- UI/UX improvements
- Performance optimizations
- Historical accuracy reviews

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Historical Sources**: Various Islamic historical texts and references
- **Map Data**: OpenStreetMap contributors
- **UI Components**: shadcn/ui and Radix UI teams
- **Icons**: Lucide React icon library
- **Inspiration**: Islamic educational institutions and scholars

## 📞 Contact

For questions, suggestions, or collaboration opportunities, please open an issue on GitHub.

---

**Built with ❤️ for Islamic education and historical preservation**
