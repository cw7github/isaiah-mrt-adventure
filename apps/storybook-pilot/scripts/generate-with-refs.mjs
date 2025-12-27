#!/usr/bin/env node
/**
 * Generate story images with character reference consistency
 *
 * Usage:
 *   node scripts/generate-with-refs.mjs --refs        # Generate character references only
 *   node scripts/generate-with-refs.mjs --page 1     # Generate page 1 using references
 *   node scripts/generate-with-refs.mjs --all        # Generate all pages using references
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OPENROUTER_API_KEY = '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';

// Character definitions for reference sheets
const CHARACTERS = {
  isaiah: {
    name: 'Isaiah',
    description: `A 6-year-old Asian American boy with:
- Short black hair, slightly messy
- Warm brown eyes, round and expressive
- Round friendly face with rosy cheeks
- Child proportions (head-to-body ratio 1:5)
- Wearing cozy blue pajamas with a subtle train pattern
- Warm, curious, brave expression`,
    refPrompt: `Character reference sheet for a children's book illustration. A 6-year-old Asian American boy named Isaiah. Short black hair, warm brown eyes, round friendly face with rosy cheeks. Wearing blue pajamas with train pattern. Show: front view, 3/4 view, profile view, and two expressions (curious, brave). Clean white background, consistent lighting, miniature diorama style with warm honey lighting. Photorealistic textures, NOT cartoon or anime. High detail.`
  },

  chef_marco: {
    name: 'Chef Marco',
    description: `A jovial Italian chef in his 50s with:
- Magnificent curly black mustache
- Warm olive skin, laugh lines around eyes
- Tall white chef's hat (toque)
- White double-breasted chef jacket with brass buttons
- Rotund, friendly build
- Warm welcoming smile`,
    refPrompt: `Character reference sheet for a children's book illustration. Chef Marco, a jovial Italian man in his 50s. Magnificent curly black mustache, warm olive skin, laugh lines. Tall white chef's hat, white chef jacket with brass buttons. Rotund friendly build. Show: front view, 3/4 view, profile view, and two expressions (welcoming smile, amazed). Clean white background, consistent lighting, miniature diorama style with warm honey lighting. Photorealistic textures, NOT cartoon or anime. High detail.`
  },

  mouse: {
    name: 'Whiskers the Mouse',
    description: `A small adorable grey mouse with:
- Soft grey fur
- Large expressive round eyes
- Pink inner ears
- Long whiskers
- Small pink nose
- Tiny pink paws`,
    refPrompt: `Character reference sheet for a children's book illustration. An adorable small grey mouse named Whiskers. Soft grey fur, very large expressive round black eyes, pink inner ears, long whiskers, small pink nose, tiny pink paws. Show: front view, side view, sitting pose, and two expressions (hungry/hopeful, happy/grateful). Clean white background, consistent lighting, miniature diorama style with warm honey lighting. Photorealistic textures, cute but NOT cartoon or anime. High detail, slightly anthropomorphized but still mouse-like.`
  }
};

// Scene prompts - ONLY describe the environment, not the characters
const SCENE_PROMPTS = {
  1: {
    scene: 'bedroom',
    label: 'The Bedroom at Midnight',
    environment: `Interior of a child's cozy bedroom at midnight. Warm wood paneling, vintage toys on shelves, a brass bedside lamp casting golden light. A quilted blanket with train patterns on the bed. Through a frost-covered window, distant train tracks glow mysteriously under moonlight. Silvery blue moonlight mixing with warm lamp light.`,
    characters: ['isaiah'],
    action: 'Isaiah sits up in bed, looking out the frost-covered window with wonder and curiosity.'
  },

  2: {
    scene: 'platform',
    label: 'The Magical Train Arrives',
    environment: `A Victorian-era train platform at midnight. Cobblestone ground, wrought iron details, gas lamps casting warm pools of golden light. Swirling magical mist. Stars twinkling overhead. A magnificent golden steam locomotive with ornate brass fittings emerges from the mist, warm glowing windows, wisps of fragrant steam.`,
    characters: [],
    action: 'The magical pizza train arrives at the platform, steam forming heart and star shapes.'
  },

  3: {
    scene: 'train_interior',
    label: 'Meeting Chef Marco',
    environment: `Interior of a luxurious vintage train car. Warm mahogany wood paneling, brass fixtures and lanterns, red velvet seats with gold trim. Art deco details on the ceiling. Warm amber lighting from vintage sconces. Through the windows, a magical starlit landscape passes by.`,
    characters: ['isaiah', 'chef_marco'],
    action: 'Chef Marco stands in the doorway welcoming Isaiah aboard with a warm smile and open arms. Isaiah looks up at him with amazement.'
  },

  4: {
    scene: 'kitchen_scroll',
    label: 'The Ancient Recipe',
    environment: `A train kitchen car filled with magical ingredients. Copper pots hanging from the ceiling, jars of colorful spices on wooden shelves, a vintage brick pizza oven (unlit) in the background. Warm candlelight creating dramatic shadows. Rich wood textures, brass utensils.`,
    characters: ['chef_marco'],
    action: 'Chef Marco holds an ancient glowing scroll showing three mystical symbols: a golden crumb, an orange spark, and a red seed. The scroll radiates warm golden light.'
  },

  5: {
    scene: 'kitchen_mouse',
    label: 'The Hungry Mouse',
    environment: `Cozy corner of the train kitchen. Copper pots, wooden cutting boards, hanging herbs and garlic. Ceramic jars labeled in Italian. A warm brick oven glows softly in the background. Intimate amber and honey-colored lighting.`,
    characters: ['isaiah', 'mouse'],
    action: 'Isaiah kneels down offering a piece of bread to a small hungry mouse. The mouse looks up hopefully with big expressive eyes.'
  },

  6: {
    scene: 'kitchen_magic',
    label: 'The Kindness Crumb',
    environment: `The train kitchen bathed in magical golden light. Floating particles of warm light drift through the air. Copper pots gleam. The atmosphere is ethereal and magical.`,
    characters: ['isaiah', 'mouse', 'chef_marco'],
    action: 'A glowing golden crumb floats in the air between Isaiah and the happy mouse, radiating magical sparkles. Chef Marco watches from the background with delight.'
  },

  7: {
    scene: 'shadow_car',
    label: 'The Dark Car',
    environment: `A dark mysterious train car. Shadows dance on vintage wallpapered walls. Dust motes float in thin beams of light from cracks. The shadows form vaguely spooky but whimsical shapes - almost like friendly creatures. Cool blue-grey tones dominate, with warm orange light spilling from behind.`,
    characters: ['isaiah'],
    action: 'Isaiah stands bravely at the threshold, warm light from behind him, facing the dancing shadows with determination.'
  },

  8: {
    scene: 'shadow_transform',
    label: 'Courage Found',
    environment: `The formerly dark train car now transforming with light. Shadows dissolving into beautiful butterflies made of golden light. Spirals of warm light swirling upward. The darkness receding to reveal warm colors underneath.`,
    characters: ['isaiah'],
    action: 'Isaiah stands confidently as shadows transform into light butterflies around him. A bright orange spark (the Courage Spark) floats near his heart, illuminating his amazed face.'
  },

  9: {
    scene: 'garden_car',
    label: 'The Heart Garden',
    environment: `A beautiful heart-shaped garden car inside the train. Lush green plants, tiny colorful flowers in brass planters. Warm sunlight streaming through a glass ceiling. Vintage watering cans, climbing vines on trellises. Butterflies flutter among the flowers. A grand but unlit Dream Oven visible in the background.`,
    characters: ['isaiah', 'chef_marco'],
    action: 'Chef Marco gestures warmly to Isaiah, explaining something important. A soft red glow emanates from Isaiah\'s chest area - the Love Seed was within him all along.'
  },

  10: {
    scene: 'celebration',
    label: 'The Dream Oven Lives',
    environment: `Magnificent celebration scene in the train's grand kitchen. A grand brass Dream Oven roaring with golden flames and magical fire. Confetti and magical sparkles filling the air. Golden pizzas floating magically. Warm, joyous, triumphant atmosphere. Rich golds, oranges, and warm amber colors everywhere.`,
    characters: ['isaiah', 'chef_marco'],
    action: 'Isaiah and Chef Marco celebrate with arms raised in joy as golden pizzas float out of the Dream Oven. The three magical ingredients glow brilliantly inside the oven.'
  }
};

const STYLE_PROMPT = `

CRITICAL STYLE REQUIREMENTS:
- Miniature diorama / tilt-shift photography aesthetic
- Warm, cozy, realistic textures (wood grain, brass, fabric)
- NOT cartoon, NOT anime, NOT kawaii, NOT watercolor
- Photorealistic materials with magical storybook charm
- Warm honey-butter (#E8C882) and amber (#C4956A) color palette
- Soft volumetric lighting like a cozy lamp
- Child-friendly, magical but grounded in reality
- High detail, cinematic quality like a Pixar still
- Absolutely NO text, words, or letters in the image
- Horizontal landscape orientation (16:9 aspect ratio)`;

async function loadImageAsBase64(filepath) {
  try {
    const data = await fs.readFile(filepath);
    const ext = path.extname(filepath).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${data.toString('base64')}`;
  } catch (err) {
    return null;
  }
}

async function generateImage(prompt, referenceImages = []) {
  // Build content array with reference images first, then prompt
  const content = [];

  // Add reference images
  for (let i = 0; i < referenceImages.length; i++) {
    const ref = referenceImages[i];
    content.push({
      type: 'image_url',
      image_url: { url: ref.base64 }
    });
  }

  // Build the prompt with reference instructions
  let fullPrompt = '';
  if (referenceImages.length > 0) {
    fullPrompt += 'REFERENCE IMAGES:\n';
    referenceImages.forEach((ref, i) => {
      fullPrompt += `- Image ${i + 1}: ${ref.description}\n`;
    });
    fullPrompt += '\nUSE THESE REFERENCES to maintain character consistency. ';
    fullPrompt += 'The characters should look EXACTLY like their reference images.\n\n';
  }

  fullPrompt += prompt;

  content.push({ type: 'text', text: fullPrompt });

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
      messages: [{ role: 'user', content }],
      modalities: ['text', 'image'],
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  const images = message?.images;

  if (images && Array.isArray(images) && images.length > 0) {
    for (const image of images) {
      const url = image.image_url?.url;
      if (url) {
        const match = url.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          return { format: match[1], data: match[2] };
        }
      }
    }
  }

  throw new Error('No image in response');
}

async function generateCharacterReferences() {
  console.log('\n🎨 Generating Character Reference Sheets...\n');

  const refsDir = path.join(ROOT, 'assets', 'images', 'refs');
  await fs.mkdir(refsDir, { recursive: true });

  for (const [key, char] of Object.entries(CHARACTERS)) {
    console.log(`  📸 Generating ${char.name} reference sheet...`);

    try {
      const result = await generateImage(char.refPrompt + STYLE_PROMPT);
      const filename = `${key}_ref.${result.format}`;
      const filepath = path.join(refsDir, filename);

      await fs.writeFile(filepath, Buffer.from(result.data, 'base64'));
      console.log(`     ✅ Saved: refs/${filename}`);
    } catch (err) {
      console.error(`     ❌ Failed: ${err.message}`);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Character references generated!\n');
}

async function generatePageWithRefs(pageNum) {
  const sceneData = SCENE_PROMPTS[pageNum];
  if (!sceneData) {
    console.error(`No scene data for page ${pageNum}`);
    return;
  }

  console.log(`\n🎨 Generating Page ${pageNum}: ${sceneData.label}`);

  // Load character references
  const references = [];
  const refsDir = path.join(ROOT, 'assets', 'images', 'refs');

  for (const charKey of sceneData.characters) {
    const char = CHARACTERS[charKey];
    if (!char) continue;

    // Try to load reference image
    const refPath = path.join(refsDir, `${charKey}_ref.png`);
    const refPathJpeg = path.join(refsDir, `${charKey}_ref.jpeg`);

    let base64 = await loadImageAsBase64(refPath);
    if (!base64) base64 = await loadImageAsBase64(refPathJpeg);

    if (base64) {
      references.push({
        base64,
        description: `${char.name} - ${char.description}`
      });
      console.log(`   📎 Using ${char.name} reference`);
    } else {
      console.log(`   ⚠️  No reference found for ${char.name}`);
    }
  }

  // Build the scene prompt
  let prompt = `Generate a beautiful storybook illustration for page ${pageNum}.\n\n`;
  prompt += `SCENE: ${sceneData.label}\n\n`;
  prompt += `ENVIRONMENT (this is a DIFFERENT location from other pages):\n${sceneData.environment}\n\n`;
  prompt += `ACTION:\n${sceneData.action}\n`;
  prompt += STYLE_PROMPT;

  try {
    const result = await generateImage(prompt, references);

    const imagesDir = path.join(ROOT, 'assets', 'images');
    const filename = `page${pageNum}_scene.${result.format}`;
    const filepath = path.join(imagesDir, filename);

    await fs.writeFile(filepath, Buffer.from(result.data, 'base64'));
    console.log(`   ✅ Saved: ${filename}`);

    // Update manifest
    const manifestPath = path.join(imagesDir, 'manifest.json');
    let manifest = {};
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    } catch {}

    manifest[`page${pageNum}`] = {
      file: filename,
      generated: new Date().toISOString(),
      withRefs: sceneData.characters
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  } catch (err) {
    console.error(`   ❌ Failed: ${err.message}`);
  }
}

async function generateAllPages() {
  console.log('\n🚂 Generating all story pages with character references...\n');

  for (let page = 1; page <= 10; page++) {
    await generatePageWithRefs(page);
    // Delay between pages
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n✅ All pages generated!\n');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--refs')) {
  generateCharacterReferences().catch(console.error);
} else if (args.includes('--page')) {
  const pageIndex = args.indexOf('--page');
  const pageNum = parseInt(args[pageIndex + 1]);
  if (pageNum >= 1 && pageNum <= 10) {
    generatePageWithRefs(pageNum).catch(console.error);
  } else {
    console.error('Invalid page number. Use 1-10.');
  }
} else if (args.includes('--all')) {
  generateAllPages().catch(console.error);
} else {
  console.log(`
Usage:
  node scripts/generate-with-refs.mjs --refs        Generate character reference sheets
  node scripts/generate-with-refs.mjs --page <N>    Generate page N using references
  node scripts/generate-with-refs.mjs --all         Generate all pages using references
  `);
}
