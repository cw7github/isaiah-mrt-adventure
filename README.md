# Isaiah's MRT Food Adventure

An interactive Grade 1 learning app (ELA + Math) with a Taipei MRT-themed journey through learning stations.

## Quick Start

### Running Locally

1. Open Terminal and navigate to the project directory
2. Run the start script:
   ```bash
   ./start.sh
   ```
3. Open your browser to: `http://localhost:8080`

That's it! The app will load and you can start exploring the stations.

## Documentation

- Agent/contributor workflow: `AGENTS.md`
- Docs index: `docs/README.md`
- Content quality bar: `docs/content-standards.md`

## Project Overview

Isaiah's MRT Food Adventure transforms first-grade English Language Arts learning into an exciting train journey through Taipei's MRT system. Students travel from station to station, each focused on a specific reading or language skill from the California Common Core State Standards.

### Key Features

- **ELA + Math station packs**: content-driven lessons from JSON content packs
- **Hundreds of interactive pages**: read pages, menus, questions, and practice
- **Gamified Progress**: Earn stickers and unlock new stations
- **Audio Support**: Prebuilt ElevenLabs TTS + word highlighting, with safe fallbacks
- **Beautiful UI**: Taipei-themed Ghibli-style backgrounds
- **Progress + Mastery**: Local-first progress, optional cloud sync, per-skill mastery model
- **Adaptive Learning**: Recommends what to practice next based on mastery + review due

### Content Breakdown

The content pack includes:
- **ELA stations** organized into learning lines:
  - RF (Reading: Foundational Skills) - 17 stations
  - RL (Reading: Literature) - 9 stations
  - RI (Reading: Informational Text) - 9 stations
  - L-G (Language: Grammar) - 10 stations
  - L-V (Language: Vocabulary) - 5 stations
  - Review Sprints - 6 stations

- **Math stations** organized into learning lines:
  - OA, NBT, MD, G, Review

- **Aligned to CPA Grade 1 ELA/Math checklists**

### Learning Lines

1. **RF - Reading Foundations**
   - Print concepts, phonics, blending, syllables
   - Sight words (Bands A-E)
   - Reading fluency

2. **RL - Reading Literature**
   - Key details and retelling
   - Character, setting, plot
   - Story elements and comparisons

3. **RI - Reading Informational Text**
   - Main topic and details
   - Text features and connections
   - Supporting evidence

4. **L-G - Language Grammar**
   - Capitalization and punctuation
   - Parts of speech (nouns, verbs, adjectives)
   - Sentence structure

5. **L-V - Language Vocabulary**
   - Context clues and word parts
   - Word relationships and meanings
   - Using new words in context

## File Structure

### Core Application Files
```
.
├── index.html                              # Main application entry point
├── start.sh                                # Quick start script
├── station-selection.js                    # Station selection screen
├── station-selection.css                   # Station selection styles
├── read-page.js                           # Reading page component
├── read-page.css                          # Reading page styles
├── progress-tracking-system.js            # Progress tracking helpers (legacy + utilities)
├── ui_improvements.css                    # Global UI styles
└── content/
    └── cpa-grade1-ela/
        └── content-pack.v1.json           # Main content pack (56 stations)
    └── cpa-grade1-math/
        └── content-pack.v1.json           # Math content pack
```

### Documentation
```
├── README.md                              # This file
├── AGENTS.md                              # Repo workflow for agents/contributors
├── docs/guides/deployment.md              # Deployment checklist
└── docs/README.md                         # Docs index + links
```

## Audio Generation

The app supports text-to-speech audio for all reading passages. Audio files are generated using ElevenLabs API.

### How it works (current)

- Prebuilt audio lives in `assets/tts/` and is referenced by `assets/tts/manifest.json`.
- `index.html` → `speak()` plays prebuilt audio first, then falls back to:
  - `POST /api/tts` (ElevenLabs) when cloud auth is available, else
  - browser SpeechSynthesis (“computer voice”).

### Regenerating prebuilt audio

```bash
node scripts/generate-tts-assets.mjs --check
node scripts/generate-tts-assets.mjs
```

See `docs/AUDIO_SYSTEM.md` for details.

## Development Notes

### Technologies Used
- Pure JavaScript (no frameworks)
- CSS3 with custom properties
- LocalStorage for progress tracking
- Python `http.server` for local development

### Content Pack Format

The content pack is a JSON file with this structure:
```json
{
  "schemaVersion": 1,
  "stationOrder": [...],
  "stations": {
    "station_id": {
      "name": "Station Name",
      "icon": "📚",
      "line": "RF",
      "pages": [...]
    }
  }
}
```

### Progress Tracking

Student progress is saved in browser LocalStorage:
- Station completion status
- Stickers earned
- Current station and page
- Answer history

To reset progress: Clear browser data or use the in-app reset button.

## Testing

### Manual Testing Checklist

1. Station Selection Screen
   - [ ] Stations load correctly
   - [ ] Lines display properly (RF, RL, RI, L-G, L-V)
   - [ ] Can click on unlocked stations
   - [ ] Locked stations show lock icon

2. Reading Pages
   - [ ] Text displays correctly
   - [ ] Images load (if available)
   - [ ] Audio controls work (if enabled)
   - [ ] Navigation buttons work (Next, Back)
   - [ ] Progress saves automatically

3. Progress System
   - [ ] Completed stations show checkmarks
   - [ ] Stickers are awarded correctly
   - [ ] Progress persists after refresh
   - [ ] Reset function works

## Deployment

See `docs/guides/deployment.md` for detailed deployment instructions.

### Quick Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to deploy

## Troubleshooting

### App won't load
- Check browser console for errors
- Ensure all CSS and JS files are present
- Verify content-pack.v1.json is valid JSON

### Stations not showing
- Check content pack path in index.html
- Verify content-pack.v1.json exists
- Check browser console for loading errors

### Progress not saving
- Ensure browser allows LocalStorage
- Check browser privacy settings
- Try different browser

### Audio not playing
- If you hear a generic computer voice, a prebuilt clip is missing.
- Run `node scripts/generate-tts-assets.mjs --check` and regenerate.
- App works fine without audio (text is always shown)
- Check API endpoints if deployed

## Credits

- **Content**: Based on California Common Core State Standards for Grade 1 ELA
- **Design Inspiration**: Taipei MRT system and Studio Ghibli aesthetics
- **Icons**: Emoji and custom SVG icons
- **Fonts**: Nunito, Fredoka, Outfit (Google Fonts)

## License

This educational software is created for personal/educational use.

## Future Enhancements

- [ ] Parent dashboard for progress tracking
- [ ] Additional content packs for other grades
- [ ] Multiplayer features
- [ ] Achievement badges and rewards
- [ ] Print-friendly progress reports
- [ ] Offline mode with service workers
- [ ] Mobile app version
