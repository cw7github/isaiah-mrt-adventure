# Deployment Checklist

This document provides a comprehensive checklist for deploying Isaiah's MRT Food Adventure.

## Pre-Deployment Checklist

### 1. Content Verification

- [x] Validate JSON structure of content-pack.v1.json
- [x] Verify all 56 stations are present
- [x] Confirm 505+ pages are included
- [ ] Review all text content for typos/errors
- [ ] Verify all station names and descriptions
- [ ] Check sticker assignments

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

1. **Landing Page**
   - [ ] Page loads without errors
   - [ ] Title and description correct
   - [ ] All styles load correctly
   - [ ] Fonts load (Nunito, Fredoka, Outfit)

2. **Station Selection**
   - [ ] All 56 stations visible
   - [ ] Lines display correctly (RF, RL, RI, L-G, L-V)
   - [ ] Station icons show
   - [ ] Click on first station works
   - [ ] Locked stations show lock icon
   - [ ] Unlocked stations are clickable

3. **Reading Pages**
   - [ ] First page loads
   - [ ] Text displays correctly
   - [ ] Navigation buttons work (Next/Back)
   - [ ] Audio button appears (if enabled)
   - [ ] Audio plays (if enabled)
   - [ ] Images load (if present)

4. **Progress System**
   - [ ] Complete a page, check progress saves
   - [ ] Refresh browser, progress persists
   - [ ] Complete a station, unlock next station
   - [ ] Stickers are awarded
   - [ ] Reset progress button works

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
- Content packs: `content/cpa-grade1-ela/content-pack.v1.json`, `content/cpa-grade1-math/content-pack.v1.json`

## Version History

- v1.0 (2024-12-22): Initial deployment
  - 56 stations
  - 505 pages
  - Progress tracking
  - Audio support (optional)
  - Taipei MRT theme
