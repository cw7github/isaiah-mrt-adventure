# Deployment Guide

This document covers deploying Isaiah's MRT Food Adventure to Vercel.

## Current Architecture (Dec 2025)

The app has been **pivoted to Food-only** with interactive choose-your-adventure stories:

| Component | Status |
|-----------|--------|
| Food stations (6 pilot) | ✅ Active - fruit, drink, bakery, pizza, bubbletea, icecream |
| Food stations (9 more) | 🔜 Coming soon placeholders on map |
| ELA content (56 stations) | 📦 Archived in `archive/` |
| Math content (28 stations) | 📦 Archived in `archive/` |

## Quick Deploy

```bash
# From repo root
npm run deploy
# or
vercel --prod --yes
```

**Production URL:** https://isaiah-mrt-adventure.vercel.app

## Vercel Account Requirements

### Free Tier Limitations
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Function timeouts: 10s (Hobby)

### Pro Tier Benefits (Recommended)
- Higher bandwidth limits
- Longer build times
- Better support for large asset bundles (this repo has ~400MB of TTS audio in `assets/tts/`)

If deploys hang or timeout on the free tier, upgrading to Pro typically resolves the issue.

## Deploy Hygiene: `.vercelignore`

The `.vercelignore` file excludes non-runtime content from deploys:

```
archive/           # Archived ELA/Math content
docs/              # Documentation (not needed in prod)
generated_assets/  # Build artifacts
tmp_*/             # Scratch files
*.pdf              # Large reference files
index.html.backup* # Backup files
```

This keeps deploy bundles small and fast.

## Troubleshooting Deployment

### "Network timeout" or "ENOTFOUND api.vercel.com"

This happens when the deployment environment can't reach Vercel's API (common in sandboxed CI/Codex environments).

**Solution:** Deploy from a terminal with normal network access:
```bash
cd /path/to/isaiah_school
vercel --prod --yes
```

### Deploy succeeds but site shows old content

Vercel caches aggressively. Force a cache bust:
```bash
vercel --prod --yes --force
```

Or from the Vercel dashboard: Deployments → latest → Redeploy.

### "Function bundle too large"

The TTS audio files (`assets/tts/`, ~400MB) are static assets, not functions. If you see function size errors:
1. Ensure `vercel.json` correctly routes `/api/*` functions
2. Static assets should not be bundled with functions

## Pre-Deployment Checklist

### 1. Content Verification

- [x] Story graphs defined for pilot stations (FOOD_STORY_GRAPHS)
- [x] All pilot stations have scene images
- [ ] Review story text for typos/errors
- [ ] Verify comprehension questions have correct answers
- [ ] Test all branching paths reach valid endings

### 2. Code Quality

- [x] All core JS files present (station-selection.js, read-page.js, etc.)
- [x] All CSS files linked in index.html
- [ ] No console.error statements in production code
- [ ] Remove debug logging statements
- [ ] Test in multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify responsive design works

### 3. Assets

- [ ] Generate or verify all station images
- [ ] Create missing food/icon images
- [ ] Optimize images for web (compress if needed)
- [ ] Generate audio files (optional, see Audio Generation section)
- [ ] Verify mascot.png and train.png exist
- [ ] Check all SVG icons load correctly

### 4. Configuration

- [ ] Update meta tags in index.html (title, description)
- [ ] Set favicon
- [ ] Configure analytics (if using)
- [ ] Set up error tracking (optional: Sentry, etc.)
- [ ] Review and update content pack version

## Audio Generation

Audio improves accessibility and fluency, but the app remains fully usable without it.

### How the current system works

- Prebuilt audio lives in `assets/tts/` and is indexed by `assets/tts/manifest.json`.
- If a clip is missing, the app may fall back to:
  - `POST /api/tts` (ElevenLabs) **only when Firebase auth is configured**, else
  - browser SpeechSynthesis (“computer voice”).

### Prebuild audio (recommended)

From repo root:

```bash
node scripts/generate-tts-assets.mjs --check
node scripts/generate-tts-assets.mjs
```

Required env vars (see `.env.example`):
- `ELEVENLABS_API_KEY`
- Optional: `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_OUTPUT_FORMAT`

### Enable `/api/tts` fallback (optional)

If you want missing strings to generate on-demand in production, set Vercel env vars for:
- ElevenLabs (`ELEVENLABS_*`)
- Firebase (`FIREBASE_PROJECT_ID` at minimum; see `.env.example`)
- (Recommended hardening) `TTS_ALLOWED_ORIGINS` or `TTS_ALLOWED_ORIGIN_REGEX`

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides free hosting with automatic HTTPS and edge caching.

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add: `ELEVENLABS_API_KEY` (if using audio)

5. **Set Custom Domain** (optional)
   - Go to Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

**Vercel Configuration:**

The project includes `vercel.json` configuration:
- Static files are served from root
- API functions are in `/api` directory
- Automatic HTTPS
- Global CDN

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

3. Follow prompts to configure

### Option 3: GitHub Pages

1. Create GitHub repository
2. Push code to repository
3. Enable GitHub Pages in repository settings
4. Set source to `main` branch

**Note:** GitHub Pages doesn't support serverless functions, so `/api/*` endpoints (cloud save, `/api/tts`) won't work. The app will still run with local progress + prebuilt `assets/tts/`.

### Option 4: Self-Hosted

Requirements:
- Web server (Apache, Nginx, etc.)
- HTTPS certificate (Let's Encrypt)
- Node.js (for audio API endpoints)

Steps:
1. Copy all files to web server
2. Configure web server to serve index.html
3. Set up Node.js backend for audio generation
4. Configure HTTPS

## Post-Deployment Verification

### Functionality Tests

1. **Welcome Screen**
   - [ ] Train animation loops smoothly (no flash on restart)
   - [ ] "Board the Train" button navigates to MRT map
   - [ ] Platform doors animate open/closed

2. **MRT Map (Food Network)**
   - [ ] 6 pilot stations are clickable (fruit, drink, bakery, pizza, bubbletea, icecream)
   - [ ] Other stations show "SOON" overlay
   - [ ] Pan/drag navigation works on mobile
   - [ ] Station icons and names display correctly

3. **Story Flow (Choose Your Adventure)**
   - [ ] Story starts with first read node
   - [ ] Choice menus show icons and descriptions
   - [ ] Branching paths lead to different content
   - [ ] Comprehension questions ("Story Check") work
   - [ ] Multiple endings are reachable
   - [ ] "Try a different path" replay works

4. **Audio System**
   - [ ] Sound button toggles narration
   - [ ] Word-by-word highlighting syncs with audio
   - [ ] Audio stops when navigating away
   - [ ] No audio plays without user interaction (iOS Safari compliance)

5. **Progress System**
   - [ ] Stories completed are tracked
   - [ ] Endings unlocked are saved
   - [ ] Refresh browser, progress persists
   - [ ] Stickers are awarded on story completion

5. **Cross-Browser Testing**
   - [ ] Chrome (desktop)
   - [ ] Safari (desktop)
   - [ ] Firefox (desktop)
   - [ ] Chrome (mobile)
   - [ ] Safari (iOS)
   - [ ] Samsung Internet (Android)

6. **Performance**
   - [ ] Page loads in under 3 seconds
   - [ ] No console errors
   - [ ] Images load quickly
   - [ ] Smooth transitions/animations
   - [ ] LocalStorage works

### Mobile Responsiveness

- [ ] Layout works on small screens (320px+)
- [ ] Touch targets are large enough
- [ ] Text is readable without zooming
- [ ] Navigation works with touch
- [ ] No horizontal scrolling

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility (basic)
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] Alt text for images

## Monitoring and Maintenance

### Analytics (Optional)

Add Google Analytics or similar:
```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking (Optional)

Consider adding Sentry for error tracking:
```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: "production"
  });
</script>
```

### Backup Strategy

- [ ] Backup content-pack.v1.json regularly
- [ ] Version control with Git
- [ ] Export student progress data (if needed)
- [ ] Backup audio files (`assets/tts/`)

### Update Strategy

When updating content:
1. Update content-pack.v1.json
2. Increment schemaVersion
3. Test locally first
4. Deploy to staging (if available)
5. Test all changes
6. Deploy to production
7. Monitor for errors

## Security Considerations

- [ ] HTTPS enabled
- [ ] API keys stored securely (environment variables)
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy headers (optional)
- [ ] Rate limiting on API endpoints (if using audio)

## Performance Optimization

### Already Implemented
- ✓ Preload critical assets (mascot, train, food images)
- ✓ Google Fonts optimization
- ✓ CSS minification (in production)
- ✓ LocalStorage for progress (no server calls)

### Future Optimizations
- [ ] Lazy load images
- [ ] Service worker for offline support
- [ ] Compress images (WebP format)
- [ ] Code splitting for large JSON
- [ ] CDN for static assets

## Rollback Plan

If deployment fails or critical bugs are found:

1. **Vercel**: Use deployment rollback feature
   - Go to Deployments tab
   - Find previous working deployment
   - Click "Promote to Production"

2. **Other platforms**: Redeploy previous version
   ```bash
   git revert HEAD
   git push
   vercel --prod
   ```

3. **Emergency**: Take site offline temporarily
   - Display maintenance page
   - Fix issues
   - Redeploy

## Support and Documentation

- [ ] Create user guide for parents/teachers
- [ ] Document common issues and solutions
- [ ] Provide contact information for support
- [ ] Create video walkthrough (optional)

## Launch Checklist

Final steps before announcing the app:

- [ ] All deployment verification tests passed
- [ ] Analytics configured (if using)
- [ ] Documentation complete
- [ ] Support contact information added
- [ ] Backup systems in place
- [ ] Performance tested
- [ ] Security verified
- [ ] Mobile tested
- [ ] Ready to announce!

## Post-Launch

- [ ] Monitor error logs daily (first week)
- [ ] Collect user feedback
- [ ] Track usage analytics
- [ ] Plan content updates
- [ ] Consider parent dashboard feature
- [ ] Plan additional grade levels

## Contact Information

For deployment issues or questions:
- Story content: `index.html` (inline `FOOD_STORY_GRAPHS` object)
- Archived content: `archive/` directory

## Version History

- v2.0 (2025-12-24): **Food-only pivot with Choose Your Adventure stories**
  - Pivoted from curriculum-based ELA/Math to interactive food station stories
  - 6 pilot stations with branching narratives (8+ choice points, 3-5 endings each)
  - Archived all ELA (56 stations) and Math (28 stations) content
  - Added `.vercelignore` to exclude archived content from deploys
  - Fixed train animation flash on welcome screen
  - Fixed audio/highlight cleanup on navigation
  - Upgraded to Vercel Pro for reliable large-bundle deploys

- v1.0 (2024-12-22): Initial deployment
  - 56 ELA stations, 28 Math stations
  - 505+ pages
  - Progress tracking
  - Audio support (optional)
  - Taipei MRT theme
