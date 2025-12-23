# Audio System Implementation Checklist

> **Legacy doc**: This describes the older audio-manifest pipeline (`content/*/audio-manifest.json` + `assets/audio/...`).  
> For the current `assets/tts/` + `index.html` → `speak()` system, see `../../AUDIO_SYSTEM.md`.

Use this checklist to implement the audio system step by step.

## Phase 1: Setup and Configuration

- [ ] **Get ElevenLabs Account**
  - [ ] Sign up at https://elevenlabs.io
  - [ ] Get API key from dashboard
  - [ ] Find Angela voice ID (or choose alternative voice)
  - [ ] Note the voice ID for next step

- [ ] **Configure Generation Script**
  - [ ] Open `scripts/generate-audio.mjs`
  - [ ] Find line: `const VOICE_IDS = {`
  - [ ] Replace `'VOICE_ID_HERE'` with actual voice ID
  - [ ] Save file

- [ ] **Set Environment Variable**
  ```bash
  export ELEVENLABS_API_KEY=your_api_key_here
  ```
  - [ ] For permanent setup, add to `~/.zshrc` or `~/.bashrc`

## Phase 2: Test Generation

- [ ] **Verify Manifest**
  ```bash
  node scripts/audio-stats.mjs
  ```
  - [ ] Confirm 2,683 clips shown
  - [ ] Review breakdown by type
  - [ ] Check cost estimate

- [ ] **Test Dry Run**
  ```bash
  node scripts/generate-audio.mjs --dry-run
  ```
  - [ ] Verify script loads correctly
  - [ ] Check voice ID is recognized
  - [ ] Review sample texts to be generated

- [ ] **Generate Test Station**
  ```bash
  node scripts/generate-audio.mjs --station=rf_f1_print_concepts
  ```
  - [ ] Wait for completion (~1-2 minutes)
  - [ ] Check `assets/audio/ela/` for MP3 files
  - [ ] Listen to a few files to verify quality
  - [ ] Confirm voice sounds appropriate

## Phase 3: Test Playback

- [ ] **Open Demo Page**
  - [ ] Navigate to `examples/audio-integration-example.html`
  - [ ] Open in Chrome/Firefox/Safari
  - [ ] Click "Initialize" button

- [ ] **Test Single Playback**
  - [ ] Click "Play Station Announcement"
  - [ ] Verify audio plays
  - [ ] Check console for errors

- [ ] **Test Queue Playback**
  - [ ] Click "Play Full Read Page"
  - [ ] Verify multiple clips play in sequence
  - [ ] Test "Stop" and "Skip" buttons

- [ ] **Test Word Highlighting**
  - [ ] Click "Play with Word Highlighting"
  - [ ] Verify words highlight during playback

- [ ] **Test Volume Control**
  - [ ] Adjust volume slider
  - [ ] Verify volume changes

## Phase 4: Full Generation

- [ ] **Estimate Costs**
  - Total characters: 60,090
  - Estimated cost: ~$18
  - [ ] Ensure ElevenLabs account has sufficient credits

- [ ] **Generate All Audio**
  ```bash
  node scripts/generate-audio.mjs
  ```
  - [ ] Let script run (~45 minutes with rate limiting)
  - [ ] Monitor progress in console
  - [ ] Note any failures

- [ ] **Verify Completion**
  ```bash
  node scripts/audio-stats.mjs
  ```
  - [ ] Confirm "Generated: 2,683 (100%)"
  - [ ] Check `assets/audio/ela/` file count
  - [ ] Verify manifest updated

## Phase 5: Integration into App

- [ ] **Add Script Tags**
  - [ ] Open main `index.html`
  - [ ] Add before closing `</body>`:
    ```html
    <script src="lib/audio-player.js"></script>
    <script src="lib/ela-audio-helper.js"></script>
    ```

- [ ] **Initialize Player**
  - [ ] Find app initialization code
  - [ ] Add audio player initialization:
    ```javascript
    const audioPlayer = new AudioPlayer({
      manifestPath: 'content/cpa-grade1-ela/audio-manifest.json',
      volume: 0.8,
      onWordHighlight: (data) => {
        // TODO: Implement word highlighting
      },
      onQueueComplete: () => {
        // TODO: Enable next button
      }
    });
    await audioPlayer.initialize();
    ```

- [ ] **Add to Station Entry**
  - [ ] Find function that loads a station
  - [ ] Add announcement playback:
    ```javascript
    await audioPlayer.play(ELAAudio.announcement(stationId));
    ```
  - [ ] Add preloading:
    ```javascript
    const preloadIds = getPreloadStrategy(stationId, 0, 3);
    await audioPlayer.preloadBatch(preloadIds);
    ```

- [ ] **Add to Read Pages**
  - [ ] Find read page display function
  - [ ] Add audio queueing:
    ```javascript
    audioPlayer.clearQueue();
    audioPlayer.enqueue(ELAAudio.sentence(stationId, pageIndex));
    audioPlayer.enqueue(ELAAudio.readingTip(stationId, pageIndex));
    await audioPlayer.processQueue();
    ```

- [ ] **Add to Question Pages**
  - [ ] Find question page display function
  - [ ] Add audio queueing:
    ```javascript
    audioPlayer.clearQueue();
    audioPlayer.enqueue(ELAAudio.question(stationId, pageIndex));
    audioPlayer.enqueue(ELAAudio.passage(stationId, pageIndex));
    await audioPlayer.processQueue();
    ```

- [ ] **Add to Answer Handling**
  - [ ] Find answer click handler
  - [ ] Add audio feedback:
    ```javascript
    await audioPlayer.play(ELAAudio.answer(stationId, pageIndex, answerIndex));
    if (isCorrect) {
      await audioPlayer.play(ELAAudio.success(stationId, pageIndex));
    } else {
      await audioPlayer.play(ELAAudio.hint(stationId, pageIndex));
    }
    ```

- [ ] **Add to Menu Pages**
  - [ ] Find menu page display function
  - [ ] Add audio queueing:
    ```javascript
    audioPlayer.clearQueue();
    audioPlayer.enqueue(ELAAudio.menuPrompt(stationId, pageIndex));
    audioPlayer.enqueue(ELAAudio.menuStory(stationId, pageIndex));
    await audioPlayer.processQueue();
    ```

## Phase 6: Testing

- [ ] **Test Station Entry**
  - [ ] Enter a station
  - [ ] Verify announcement plays
  - [ ] Check console for errors

- [ ] **Test Read Pages**
  - [ ] Navigate to read page
  - [ ] Verify sentence plays
  - [ ] Verify reading tip plays after
  - [ ] Test multiple pages

- [ ] **Test Question Pages**
  - [ ] Navigate to question page
  - [ ] Verify question plays
  - [ ] Verify passage plays
  - [ ] Click answer - verify answer audio plays
  - [ ] Test correct answer - verify success message
  - [ ] Test wrong answer - verify hint plays

- [ ] **Test Menu Pages**
  - [ ] Navigate to menu page
  - [ ] Verify prompt plays
  - [ ] Verify menu story plays
  - [ ] Test item selection

- [ ] **Test Controls**
  - [ ] Test stop button
  - [ ] Test skip button
  - [ ] Test volume control
  - [ ] Test mute/unmute

- [ ] **Cross-Browser Testing**
  - [ ] Test in Chrome
  - [ ] Test in Firefox
  - [ ] Test in Safari
  - [ ] Test on mobile (iOS Safari)
  - [ ] Test on mobile (Android Chrome)

## Phase 7: Optimization

- [ ] **Performance Testing**
  - [ ] Monitor memory usage
  - [ ] Check cache size with `player.getCacheStats()`
  - [ ] Verify preloading works
  - [ ] Test with slow network (throttling)

- [ ] **User Experience**
  - [ ] Verify audio timing feels natural
  - [ ] Check volume levels are consistent
  - [ ] Test word highlighting accuracy
  - [ ] Ensure audio doesn't block UI

- [ ] **Error Handling**
  - [ ] Test with missing audio files
  - [ ] Test with network offline
  - [ ] Test with corrupt manifest
  - [ ] Verify graceful degradation

## Phase 8: Production Deployment

- [ ] **Verify Files**
  - [ ] All 2,683 MP3 files present
  - [ ] Manifest file is up to date
  - [ ] Scripts are not deployed (dev only)
  - [ ] Documentation is accessible

- [ ] **Optimize Delivery**
  - [ ] Configure CDN caching for audio files
  - [ ] Set appropriate cache headers
  - [ ] Consider compression (gzip for manifest)

- [ ] **Monitor**
  - [ ] Add analytics for audio playback
  - [ ] Track failures and errors
  - [ ] Monitor loading times
  - [ ] Collect user feedback

## Optional Enhancements

- [ ] **Word-Level Timestamps**
  - [ ] Research ElevenLabs word timestamp API
  - [ ] Update generation script
  - [ ] Improve highlighting accuracy

- [ ] **Offline Support**
  - [ ] Implement service worker
  - [ ] Cache audio files
  - [ ] Test offline mode

- [ ] **Speed Control**
  - [ ] Add playback rate control
  - [ ] Test with different speeds
  - [ ] Save user preference

- [ ] **Background Music**
  - [ ] Create ambient tracks
  - [ ] Mix with voice audio
  - [ ] Add volume balancing

## Troubleshooting Guide

### Issue: "Manifest not found"
- [ ] Verify `audio-manifest.json` exists
- [ ] Check manifest path in AudioPlayer initialization
- [ ] Verify file permissions

### Issue: "Audio not playing"
- [ ] Check browser console for errors
- [ ] Verify MP3 files exist
- [ ] Test with different browser
- [ ] Check Web Audio API support

### Issue: "Generation failed"
- [ ] Verify ELEVENLABS_API_KEY is set
- [ ] Check voice ID is correct
- [ ] Verify network connectivity
- [ ] Check ElevenLabs account credits

### Issue: "High memory usage"
- [ ] Call `player.clearCache()` periodically
- [ ] Reduce preload lookahead count
- [ ] Clear cache between stations

## Final Verification

- [ ] All audio files generated successfully
- [ ] Demo page works correctly
- [ ] App integration complete
- [ ] Testing passed on all browsers
- [ ] Documentation is clear and accessible
- [ ] Team is trained on system usage

---

**System Status:** [ ] Not Started  [ ] In Progress  [ ] Complete

**Notes:**
_Use this space for notes, issues, or observations during implementation._

---

**Completion Date:** _______________

**Completed By:** _______________
