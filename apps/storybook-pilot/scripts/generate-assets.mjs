#!/usr/bin/env node
/**
 * MIDNIGHT PIZZA TRAIN - Complete Asset Generation
 *
 * Generates all audio and visual assets using:
 * - ElevenLabs TTS with word-level timestamps
 * - ElevenLabs Sound Effects
 * - Gemini 3 Pro Image Preview via OpenRouter
 *
 * Usage:
 *   node scripts/generate-assets.mjs --audio      # Generate narration audio
 *   node scripts/generate-assets.mjs --sfx        # Generate sound effects
 *   node scripts/generate-assets.mjs --images     # Generate scene images
 *   node scripts/generate-assets.mjs --all        # Generate everything
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ============================================
// API CONFIGURATION
// ============================================
const ELEVENLABS_API_KEY = '70c942190c7127b43c0f585835bee0912270615aa3248cf5d16cbb689efefd88';
const OPENROUTER_API_KEY = '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';

// ElevenLabs Voice Configuration - Multiple characters!
// ElevenLabs v3 requires stability values of exactly 0.0, 0.5, or 1.0
const VOICES = {
  narrator: {
    id: 'lqydY2xVUkg9cEIFmFMU', // Angela - warm, educational
    name: 'Narrator',
    settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5 }
  },
  chef_marco: {
    id: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - warm male voice
    name: 'Chef Marco',
    settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5 }
  },
  isaiah: {
    id: 'jBpfuIE2acCO8z3wKNLl', // Gigi - young, curious
    name: 'Isaiah',
    settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5 }
  },
  mouse: {
    id: 'XB0fDUnXU5powFXDhCwa', // Charlotte - small, gentle
    name: 'Mouse',
    settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5 }
  }
};

// ElevenLabs v3 model supports emotion tags natively - [warm], [excited] etc.
// are interpreted as style direction and NOT spoken aloud
const ELEVENLABS_MODEL = 'eleven_v3';

// Output directories
const AUDIO_DIR = path.join(ROOT, 'assets/audio');
const SFX_DIR = path.join(ROOT, 'assets/sfx');
const IMAGES_DIR = path.join(ROOT, 'assets/images');

// ============================================
// STORY CONTENT WITH EMOTION TAGS & VOICE ASSIGNMENTS
// ============================================
const STORY_PAGES = [
  {
    pageNumber: 1,
    scene: 'station',
    sceneLabel: 'The Station at Midnight',
    voiceAssignment: 'narrator',
    emotionText: '[calm] It was midnight. Isaiah could not sleep. [gentle] He went to the window and looked outside.',
    plainText: 'It was midnight. Isaiah could not sleep. He went to the window and looked outside.',
    imagePrompt: `Interior view of a child's cozy bedroom at midnight. A young boy silhouette stands at a large window, curtains drawn back. Outside the window, a magical golden glow illuminates misty train tracks. Warm wooden furniture, soft moonlight, brass lamp on nightstand. Miniature diorama style, warm honey lighting, realistic textures, cozy atmosphere. Horizontal 16:9 composition.`
  },
  {
    pageNumber: 2,
    scene: 'station',
    sceneLabel: 'The Magical Arrival',
    voiceAssignment: 'narrator',
    emotionText: '[awe] There was a train! [dramatic] But this was not a normal train. [excited] It was made of gold and smelled like pizza!',
    plainText: 'There was a train! But this was not a normal train. It was made of gold and smelled like pizza!',
    imagePrompt: `A magnificent golden steam locomotive emerging from swirling magical mist at a Victorian train platform. The train glows with warm amber light, brass details gleaming. Steam puffs form heart and star shapes. Pizza-shaped ornaments on the engine. Cobblestone platform with brass lanterns. Miniature diorama style, warm dramatic lighting, photorealistic materials with storybook magic. Horizontal 16:9.`
  },
  {
    pageNumber: 3,
    scene: 'train',
    sceneLabel: "The Conductor's Welcome",
    voiceAssignment: 'mixed', // narrator + chef_marco
    dialogues: [
      { voice: 'chef_marco', text: '[warm] Welcome!', emotion: 'warm' },
      { voice: 'narrator', text: 'said the conductor.', emotion: 'calm' },
      { voice: 'chef_marco', text: '[friendly] I am Chef Marco. Will you help me? [worried] The Dream Oven is broken!', emotion: 'expressive' }
    ],
    plainText: '"Welcome!" said the conductor. "I am Chef Marco. Will you help me? The Dream Oven is broken!"',
    imagePrompt: `Interior of a luxurious vintage train car with warm mahogany wood paneling and brass fixtures. A friendly Italian chef conductor with a warm smile, wearing a white chef hat with a pizza badge, stands in the doorway. Brass lanterns cast golden light. Red velvet seats, art deco details. Through windows, magical starry night. Miniature diorama style, cozy warm lighting. Horizontal 16:9.`
  },
  {
    pageNumber: 4,
    scene: 'train',
    sceneLabel: 'The Special Ingredients',
    voiceAssignment: 'mixed',
    dialogues: [
      { voice: 'chef_marco', text: '[serious] To fix the oven, we need three things.', emotion: 'serious' },
      { voice: 'chef_marco', text: '[mystical] A Kindness Crumb. A Courage Spark. And a Love Seed.', emotion: 'mystical' }
    ],
    plainText: '"To fix the oven," said Marco, "we need three things. A Kindness Crumb. A Courage Spark. And a Love Seed."',
    imagePrompt: `Chef Marco holding an ancient glowing scroll in a train car filled with magical ingredients. The scroll shows three glowing symbols: a golden crumb, an orange spark, and a red seed. Jars of colorful spices and herbs line wooden shelves. Warm candlelight, floating magical particles. Rich wood textures, brass details. Miniature diorama style. Horizontal 16:9.`
  },
  {
    pageNumber: 5,
    scene: 'kitchen',
    sceneLabel: 'The Kindness Kitchen',
    voiceAssignment: 'mixed',
    dialogues: [
      { voice: 'narrator', text: '[gentle] In the kitchen car, Isaiah saw a sad little mouse.', emotion: 'gentle' },
      { voice: 'mouse', text: '[sad] I am so hungry.', emotion: 'sad' },
      { voice: 'narrator', text: '[warm] the mouse said. Isaiah gave it some bread.', emotion: 'warm' }
    ],
    plainText: 'In the kitchen car, Isaiah saw a sad little mouse. "I am so hungry," the mouse said. Isaiah gave it some bread.',
    imagePrompt: `Cozy train kitchen car with copper pots, wooden counters, and a warm brick oven. A tiny adorable mouse with big sad eyes holds an empty bowl. Bread loaves and pastries on shelves. Warm amber lighting from the oven, steam rising. A child's hand offering bread to the mouse. Miniature diorama style, heartwarming atmosphere. Horizontal 16:9.`
  },
  {
    pageNumber: 6,
    scene: 'kitchen',
    sceneLabel: 'The First Ingredient',
    voiceAssignment: 'mixed',
    dialogues: [
      { voice: 'narrator', text: '[gentle] The mouse smiled.', emotion: 'gentle' },
      { voice: 'mouse', text: '[happy] Thank you!', emotion: 'joyful' },
      { voice: 'narrator', text: '[awe] A golden crumb appeared. It was the Kindness Crumb!', emotion: 'awe' },
      { voice: 'chef_marco', text: '[excited] Look at that!', emotion: 'excited' },
      { voice: 'narrator', text: 'said Marco with a grin.', emotion: 'warm' }
    ],
    plainText: 'The mouse smiled. "Thank you!" A golden crumb appeared. It was the Kindness Crumb! "Look at that!" said Marco with a grin.',
    imagePrompt: `Magical moment in the train kitchen. A happy mouse glowing with golden light, smiling joyfully. A sparkling golden crumb floats in the air, radiating warm light rays. Chef Marco watches in amazement. Magical sparkles fill the air. Warm honey and gold color palette. Miniature diorama style, ethereal lighting. Horizontal 16:9.`
  },
  {
    pageNumber: 7,
    scene: 'shadow',
    sceneLabel: 'The Dark Car',
    voiceAssignment: 'narrator',
    emotionText: '[dramatic] The next car was dark and scary. [tense] Isaiah felt afraid. [brave] But he walked into the darkness anyway. He had to be brave.',
    plainText: 'The next car was dark and scary. Isaiah felt afraid. But he walked into the darkness anyway. He had to be brave.',
    imagePrompt: `Dark mysterious train car with shadows dancing on the walls. A small boy silhouette bravely stepping through the doorway into darkness. Eerie blue-grey tones with hints of warm orange light from behind. Shadow shapes that look almost like friendly creatures. Distant tiny orange spark glowing in the darkness. Dramatic lighting contrast. Miniature diorama style. Horizontal 16:9.`
  },
  {
    pageNumber: 8,
    scene: 'shadow',
    sceneLabel: 'Courage Found',
    voiceAssignment: 'narrator',
    emotionText: '[triumphant] When Isaiah kept walking, the shadows went away! [awe] A bright orange spark floated to him. [excited] He had found the Courage Spark!',
    plainText: 'When Isaiah kept walking, the shadows went away! A bright orange spark floated to him. He had found the Courage Spark!',
    imagePrompt: `Triumphant scene in the train car as shadows transform into colorful butterflies and float away. A bright orange-golden spark floats toward a young boy, illuminating his amazed face. The darkness recedes to reveal beautiful warm colors. Magical transformation moment. Orange and gold burst of light. Miniature diorama style, dramatic uplighting. Horizontal 16:9.`
  },
  {
    pageNumber: 9,
    scene: 'dream',
    sceneLabel: 'The Heart of the Train',
    voiceAssignment: 'mixed',
    dialogues: [
      { voice: 'isaiah', text: '[curious] Where is the Love Seed?', emotion: 'curious' },
      { voice: 'narrator', text: 'Isaiah asked. Marco smiled.', emotion: 'gentle' },
      { voice: 'chef_marco', text: '[warm] It was with you all along. [loving] You love to help others. That is the Love Seed.', emotion: 'loving' }
    ],
    plainText: '"Where is the Love Seed?" Isaiah asked. Marco smiled. "It was with you all along. You love to help others. That is the Love Seed."',
    imagePrompt: `Beautiful heart-shaped garden car inside the train. Heart-shaped plants and flowers in warm reds and pinks. Chef Marco kneeling beside Isaiah, pointing to the boy's heart where a gentle red glow emanates. A magnificent but cold Dream Oven in the background. Warm emotional lighting, love and warmth radiating. Miniature diorama style. Horizontal 16:9.`
  },
  {
    pageNumber: 10,
    scene: 'dream',
    sceneLabel: 'The Dream Oven Glows',
    voiceAssignment: 'mixed',
    dialogues: [
      { voice: 'narrator', text: '[building] Isaiah put all three things into the oven.', emotion: 'building' },
      { voice: 'narrator', text: '[dramatic] It roared to life! [joyful] Golden pizzas flew out.', emotion: 'triumphant' },
      { voice: 'chef_marco', text: '[ecstatic] You did it!', emotion: 'ecstatic' },
      { voice: 'chef_marco', text: '[grateful] Thank you, little chef!', emotion: 'grateful' }
    ],
    plainText: 'Isaiah put all three things into the oven. It roared to life! Golden pizzas flew out. "You did it!" said Marco. "Thank you, little chef!"',
    imagePrompt: `Magnificent celebration scene. A grand brass Dream Oven blazing with golden fire and magical flames. Golden glowing pizzas magically floating out of the oven. Chef Marco and Isaiah celebrating together, arms raised in joy. Magical sparkles and warm light filling the entire train car. Triumphant, joyful atmosphere. Rich golds, oranges, and warm colors. Miniature diorama style, dramatic celebratory lighting. Horizontal 16:9.`
  }
];

// Sound effects to generate
const SOUND_EFFECTS = [
  { id: 'page_turn', prompt: 'Soft paper page turning sound, gentle rustling, book page flip', duration: 1 },
  { id: 'train_whistle', prompt: 'Magical steam train whistle, whimsical and friendly, not too loud', duration: 2 },
  { id: 'train_chug', prompt: 'Gentle steam train chugging rhythm, cozy and rhythmic, not harsh', duration: 3 },
  { id: 'magic_sparkle', prompt: 'Magical twinkling sparkle sound, like fairy dust, warm and enchanting', duration: 2 },
  { id: 'success_chime', prompt: 'Happy success chime, warm bell tones, celebratory but gentle', duration: 1.5 },
  { id: 'door_open', prompt: 'Old wooden train door creaking open, vintage, not scary', duration: 1.5 },
  { id: 'oven_roar', prompt: 'Magical oven coming to life, warm whooshing fire sound, triumphant', duration: 2 },
  { id: 'heartbeat_glow', prompt: 'Soft warm heartbeat pulse with gentle glow sound, loving', duration: 2 },
  { id: 'shadow_dissolve', prompt: 'Shadows dissolving into butterflies, light tinkling transformation', duration: 2 },
  { id: 'golden_appear', prompt: 'Magical golden object appearing, warm shimmer and glow sound', duration: 1.5 }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

// ============================================
// ELEVENLABS TTS WITH TIMESTAMPS
// ============================================
async function generateTTSWithTimestamps(text, voiceConfig, outputPath) {
  console.log(`  Generating TTS: "${text.slice(0, 50)}..."`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.id}/with-timestamps`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: voiceConfig.settings,
        output_format: 'mp3_44100_128'
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Save audio file
  const audioBuffer = Buffer.from(data.audio_base64, 'base64');
  await fs.writeFile(outputPath, audioBuffer);

  // Process word timings from character alignment
  const wordTimings = buildWordTimings(data.alignment, text);

  return {
    audioFile: path.basename(outputPath),
    duration: data.alignment.character_end_times_seconds[data.alignment.character_end_times_seconds.length - 1],
    wordTimings
  };
}

function buildWordTimings(alignment, originalText) {
  const words = [];
  let currentWord = '';
  let wordStartTime = null;
  let wordEndTime = null;
  let wordIndex = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startSec = alignment.character_start_times_seconds[i];
    const endSec = alignment.character_end_times_seconds[i];

    if (/\s/.test(char)) {
      if (currentWord) {
        words.push({
          word: currentWord,
          index: wordIndex++,
          startMs: Math.round(wordStartTime * 1000),
          endMs: Math.round(wordEndTime * 1000)
        });
        currentWord = '';
        wordStartTime = null;
      }
    } else {
      currentWord += char;
      if (wordStartTime === null) wordStartTime = startSec;
      wordEndTime = endSec;
    }
  }

  // Don't forget the last word
  if (currentWord) {
    words.push({
      word: currentWord,
      index: wordIndex,
      startMs: Math.round(wordStartTime * 1000),
      endMs: Math.round(wordEndTime * 1000)
    });
  }

  return words;
}

// ============================================
// ELEVENLABS SOUND EFFECTS
// ============================================
async function generateSoundEffect(prompt, outputPath, durationSeconds = 2) {
  console.log(`  Generating SFX: "${prompt.slice(0, 40)}..."`);

  const response = await fetch(
    'https://api.elevenlabs.io/v1/sound-generation',
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: durationSeconds,
        prompt_influence: 0.3
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs SFX failed: ${response.status} - ${error}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, audioBuffer);

  return { file: path.basename(outputPath), duration: durationSeconds };
}

// ============================================
// GEMINI IMAGE GENERATION VIA OPENROUTER
// ============================================
async function generateImage(prompt, outputPath) {
  console.log(`  Generating image: "${prompt.slice(0, 50)}..."`);

  const fullPrompt = `Generate an image: ${prompt}

Style requirements:
- Miniature diorama / tilt-shift photography style
- Warm, cozy, realistic textures (wood grain, brass, fabric)
- NOT cartoon, NOT anime, NOT kawaii
- Photorealistic materials with storybook charm
- Warm honey-butter and amber color palette
- Soft volumetric lighting
- Child-friendly, magical but grounded
- High detail, cinematic quality
- No text or words in the image`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://isaiah-apps.vercel.app',
      'X-Title': 'Isaiah Storybook'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'user', content: fullPrompt }],
      // Note: Image generation requires specific model - using text for now
      // Will need to use imagen or stable diffusion for actual images
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // For now, save the prompt response - actual image generation needs imagen model
  const result = {
    prompt: prompt,
    response: data.choices?.[0]?.message?.content || 'No response',
    outputPath: outputPath
  };

  // Save prompt for manual generation or future API update
  await fs.writeFile(
    outputPath.replace(/\.(png|jpg|jpeg)$/, '.prompt.json'),
    JSON.stringify(result, null, 2)
  );

  return result;
}

// Try Gemini's native image generation
async function generateImageGemini(prompt, outputPath) {
  console.log(`  Generating image with Gemini: "${prompt.slice(0, 50)}..."`);

  const fullPrompt = `Generate a beautiful illustration: ${prompt}

CRITICAL STYLE REQUIREMENTS:
- Miniature diorama / tilt-shift photography aesthetic
- Warm, cozy, realistic textures (wood grain, brass, fabric)
- NOT cartoon, NOT anime, NOT kawaii, NOT watercolor
- Photorealistic materials with magical storybook charm
- Warm honey-butter (#E8C882) and amber (#C4956A) color palette
- Soft volumetric lighting like a cozy lamp
- Child-friendly, magical but grounded in reality
- High detail, cinematic quality like a Pixar still
- Absolutely NO text, words, or letters in the image`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://isaiah-apps.vercel.app',
        'X-Title': 'Isaiah Storybook'
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [{
          role: 'user',
          content: fullPrompt
        }],
        modalities: ['text', 'image'],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`  API error: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Check if we got an image
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          const match = part.image_url.url.match(/^data:image\/(\w+);base64,(.+)$/);
          if (match) {
            const imageBuffer = Buffer.from(match[2], 'base64');
            await fs.writeFile(outputPath, imageBuffer);
            console.log(`  ✓ Saved image: ${path.basename(outputPath)}`);
            return { success: true, file: path.basename(outputPath) };
          }
        }
      }
    }

    // Try to find base64 image in string content
    if (typeof content === 'string') {
      const imgMatch = content.match(/data:image\/(\w+);base64,([A-Za-z0-9+/=]+)/);
      if (imgMatch) {
        const imageBuffer = Buffer.from(imgMatch[2], 'base64');
        await fs.writeFile(outputPath, imageBuffer);
        console.log(`  ✓ Saved image: ${path.basename(outputPath)}`);
        return { success: true, file: path.basename(outputPath) };
      }
    }

    // No image found - save prompt for manual generation
    console.log(`  ! No image in response, saving prompt`);
    await fs.writeFile(
      outputPath.replace(/\.(png|jpg|jpeg)$/, '.prompt.txt'),
      fullPrompt
    );
    return { success: false, prompt: fullPrompt };

  } catch (error) {
    console.log(`  ! Error: ${error.message}`);
    // Save prompt for manual generation
    await fs.writeFile(
      outputPath.replace(/\.(png|jpg|jpeg)$/, '.prompt.txt'),
      fullPrompt
    );
    return { success: false, error: error.message, prompt: fullPrompt };
  }
}

// ============================================
// MAIN GENERATION FUNCTIONS
// ============================================
async function generateAllAudio() {
  console.log('\n=== GENERATING NARRATION AUDIO ===\n');
  await ensureDir(AUDIO_DIR);

  const manifest = {
    generatedAt: new Date().toISOString(),
    model: ELEVENLABS_MODEL,
    pages: {}
  };

  for (const page of STORY_PAGES) {
    console.log(`\nPage ${page.pageNumber}: ${page.sceneLabel}`);

    const pageAudio = {
      pageNumber: page.pageNumber,
      scene: page.scene,
      segments: []
    };

    if (page.voiceAssignment === 'narrator') {
      // Single narrator voice
      const filename = `page${page.pageNumber}_narrator.mp3`;
      const outputPath = path.join(AUDIO_DIR, filename);

      try {
        const result = await generateTTSWithTimestamps(
          page.plainText,
          VOICES.narrator,
          outputPath
        );
        pageAudio.segments.push({
          voice: 'narrator',
          ...result
        });
        console.log(`  ✓ Generated: ${filename}`);
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
      }

      await sleep(500); // Rate limiting

    } else if (page.voiceAssignment === 'mixed' && page.dialogues) {
      // Multiple voice segments
      for (let i = 0; i < page.dialogues.length; i++) {
        const dialogue = page.dialogues[i];
        const voiceConfig = VOICES[dialogue.voice];
        const filename = `page${page.pageNumber}_seg${i + 1}_${dialogue.voice}.mp3`;
        const outputPath = path.join(AUDIO_DIR, filename);

        try {
          const result = await generateTTSWithTimestamps(
            dialogue.text,
            voiceConfig,
            outputPath
          );
          pageAudio.segments.push({
            voice: dialogue.voice,
            emotion: dialogue.emotion,
            ...result
          });
          console.log(`  ✓ Generated: ${filename}`);
        } catch (error) {
          console.log(`  ✗ Error: ${error.message}`);
        }

        await sleep(300); // Rate limiting between segments
      }
    }

    manifest.pages[page.pageNumber] = pageAudio;
  }

  // Save manifest
  await fs.writeFile(
    path.join(AUDIO_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✓ Audio manifest saved to assets/audio/manifest.json');
}

async function generateAllSFX() {
  console.log('\n=== GENERATING SOUND EFFECTS ===\n');
  await ensureDir(SFX_DIR);

  const manifest = {
    generatedAt: new Date().toISOString(),
    effects: {}
  };

  for (const sfx of SOUND_EFFECTS) {
    const filename = `${sfx.id}.mp3`;
    const outputPath = path.join(SFX_DIR, filename);

    try {
      const result = await generateSoundEffect(sfx.prompt, outputPath, sfx.duration);
      manifest.effects[sfx.id] = result;
      console.log(`✓ Generated: ${filename}`);
    } catch (error) {
      console.log(`✗ Error generating ${sfx.id}: ${error.message}`);
    }

    await sleep(1000); // Rate limiting
  }

  // Save manifest
  await fs.writeFile(
    path.join(SFX_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✓ SFX manifest saved to assets/sfx/manifest.json');
}

async function generateAllImages() {
  console.log('\n=== GENERATING SCENE IMAGES ===\n');
  await ensureDir(IMAGES_DIR);

  const manifest = {
    generatedAt: new Date().toISOString(),
    style: 'Realistic Cozy / Miniature Diorama',
    pages: {}
  };

  for (const page of STORY_PAGES) {
    console.log(`\nPage ${page.pageNumber}: ${page.sceneLabel}`);

    const filename = `page${page.pageNumber}_scene.png`;
    const outputPath = path.join(IMAGES_DIR, filename);

    try {
      const result = await generateImageGemini(page.imagePrompt, outputPath);
      manifest.pages[page.pageNumber] = {
        scene: page.scene,
        label: page.sceneLabel,
        ...result
      };
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      manifest.pages[page.pageNumber] = {
        scene: page.scene,
        label: page.sceneLabel,
        error: error.message,
        prompt: page.imagePrompt
      };
    }

    await sleep(2000); // Rate limiting for image generation
  }

  // Save manifest
  await fs.writeFile(
    path.join(IMAGES_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✓ Image manifest saved to assets/images/manifest.json');
}

// ============================================
// CLI ENTRY POINT
// ============================================
async function main() {
  const args = process.argv.slice(2);

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     MIDNIGHT PIZZA TRAIN - Asset Generator             ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const generateAudio = args.includes('--audio') || args.includes('--all');
  const generateSfx = args.includes('--sfx') || args.includes('--all');
  const generateImages = args.includes('--images') || args.includes('--all');

  if (!generateAudio && !generateSfx && !generateImages) {
    console.log(`
Usage:
  node scripts/generate-assets.mjs --audio      Generate narration audio
  node scripts/generate-assets.mjs --sfx        Generate sound effects
  node scripts/generate-assets.mjs --images     Generate scene images
  node scripts/generate-assets.mjs --all        Generate everything
`);
    return;
  }

  const startTime = Date.now();

  if (generateAudio) {
    await generateAllAudio();
  }

  if (generateSfx) {
    await generateAllSFX();
  }

  if (generateImages) {
    await generateAllImages();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n════════════════════════════════════════════════════════`);
  console.log(`✓ Asset generation complete in ${elapsed}s`);
  console.log(`════════════════════════════════════════════════════════\n`);
}

main().catch(console.error);
