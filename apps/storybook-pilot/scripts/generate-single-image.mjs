#!/usr/bin/env node
/**
 * Generate a single scene image for a specific page
 * Usage: node scripts/generate-single-image.mjs <page-number>
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OPENROUTER_API_KEY = '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';

const IMAGE_PROMPTS = {
  1: `Interior view of a child's cozy bedroom at midnight. A young Asian American boy (Isaiah, age 6) sits up in bed, looking out a frost-covered window. Moonlight streams in, casting silvery blue light. The room has warm wood paneling, vintage toys, a brass bedside lamp. Outside the window, distant train tracks glow mysteriously. Warm pajamas, quilted blanket with train pattern.`,

  2: `A magnificent golden steam locomotive emerging from swirling midnight mist at a magical train platform. The train is ornate with brass fittings, warm glowing windows, and wisps of fragrant steam that smell like pizza. Victorian-era platform with wrought iron details, gas lamps casting warm pools of light. Stars twinkle overhead. The train cars behind show warm light and the silhouettes of pizza ovens.`,

  3: `Interior of a luxurious vintage train car with warm mahogany wood paneling, brass fixtures, and velvet seats. Chef Marco, a jovial Italian man with a magnificent mustache, white chef's hat, and warm smile, welcomes Isaiah aboard. The chef wears a classic white double-breasted chef jacket with brass buttons. Warm amber lighting from vintage sconces. Through windows, a magical starlit landscape passes by.`,

  4: `Chef Marco holding an ancient glowing scroll in a train kitchen car. The scroll shows three mystical ingredients illustrated in gold leaf: a golden crumb, a sparkling ember, and a glowing seed. Copper pots hang overhead, vintage brick pizza oven in background (dark, not lit). Warm wood countertops, brass utensils. Dramatic warm lighting on the scroll.`,

  5: `Cozy train kitchen car with copper pots, wooden counters, and warm light. Isaiah kneels down to offer bread to a small, adorable grey mouse with big expressive eyes. The mouse looks hungry and hopeful. Vintage kitchen details: hanging herbs, ceramic jars, wooden cutting boards. Warm amber and honey-colored lighting creates intimate atmosphere.`,

  6: `Magical moment in the train kitchen. A happy mouse sits contentedly, and floating in the air between Isaiah's hands is a glowing golden crumb that sparkles with magical light. Warm particles of light drift around. Chef Marco watches with delight from the background. The whole scene is bathed in warm golden magical glow.`,

  7: `Dark mysterious train car with shadows dancing on the walls. Isaiah stands bravely at the threshold, warm light from behind him. The shadows form vaguely scary but not terrifying shapes - more whimsical than frightening. Dust motes float in beams of light. Vintage train car interior barely visible in the gloom. Contrast between the warm light behind Isaiah and the cool shadows ahead.`,

  8: `Triumphant scene in the train car as shadows transform into beautiful butterflies made of light. Isaiah stands confidently, a bright orange spark (the Courage Spark) floating near his heart. The butterflies swirl upward in spirals of warm light. The dark car is now filled with golden warmth. Magical transformation moment.`,

  9: `Beautiful heart-shaped garden car inside the train. Lush plants, tiny flowers, warm sunlight streaming through a glass ceiling. Chef Marco gestures warmly to Isaiah, explaining that the Love Seed was within him all along. A soft red glow emanates from Isaiah's chest area. Butterflies flutter among the flowers. Brass planters, vintage watering cans, climbing vines.`,

  10: `Magnificent celebration scene. A grand brass Dream Oven roars to life with golden flames. Isaiah places the three ingredients inside - they glow brilliantly. Golden pizza pies float out magically. Chef Marco cheers with arms raised. Confetti and magical sparkles fill the air. Warm, joyous lighting. The whole train car is alive with celebration and warmth.`
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

async function generateImage(pageNum) {
  const prompt = IMAGE_PROMPTS[pageNum];
  if (!prompt) {
    console.error(`No prompt found for page ${pageNum}`);
    process.exit(1);
  }

  console.log(`\n🎨 Generating image for Page ${pageNum}...`);
  console.log(`   Prompt: "${prompt.slice(0, 60)}..."`);

  const fullPrompt = `Generate a beautiful illustration: ${prompt}${STYLE_PROMPT}`;

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
      messages: [{ role: 'user', content: fullPrompt }],
      modalities: ['text', 'image'],
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`   ❌ API error: ${response.status} - ${errorText}`);
    process.exit(1);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  const content = message?.content;
  const images = message?.images;

  // Parse image from response
  let imageData = null;
  let format = 'png';

  // OpenRouter gemini-3-pro-image-preview returns images in message.images array
  if (images && Array.isArray(images) && images.length > 0) {
    for (const image of images) {
      const url = image.image_url?.url;
      if (url) {
        const match = url.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          format = match[1];
          imageData = match[2];
          console.log(`   📷 Found image in message.images array`);
          break;
        }
      }
    }
  }

  // Fallback: Try array format in content
  if (!imageData && Array.isArray(content)) {
    for (const part of content) {
      if (part.type === 'image_url' && part.image_url?.url) {
        const match = part.image_url.url.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          format = match[1];
          imageData = match[2];
          break;
        }
      }
    }
  }

  // Fallback: Try markdown format in content
  if (!imageData && typeof content === 'string') {
    const imgMatch = content.match(/!\[.*?\]\((data:image\/(\w+);base64,([^)]+))\)/);
    if (imgMatch) {
      format = imgMatch[2];
      imageData = imgMatch[3];
    }
  }

  // Fallback: Try inline base64 in content
  if (!imageData && typeof content === 'string') {
    const base64Match = content.match(/data:image\/(\w+);base64,([A-Za-z0-9+/=]+)/);
    if (base64Match) {
      format = base64Match[1];
      imageData = base64Match[2];
    }
  }

  if (!imageData) {
    console.error('   ❌ Could not extract image from response');
    console.log('   Response structure:', JSON.stringify({
      hasContent: !!content,
      contentType: typeof content,
      hasImages: !!images,
      imagesCount: images?.length || 0
    }, null, 2));
    if (typeof content === 'string') {
      console.log('   Content preview:', content.slice(0, 300));
    }
    process.exit(1);
  }

  // Save image
  const imagesDir = path.join(ROOT, 'assets', 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  const filename = `page${pageNum}_scene.${format}`;
  const outputPath = path.join(imagesDir, filename);

  await fs.writeFile(outputPath, Buffer.from(imageData, 'base64'));
  console.log(`   ✅ Saved: ${filename}`);

  // Update manifest
  const manifestPath = path.join(imagesDir, 'manifest.json');
  let manifest = {};
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {}

  manifest[`page${pageNum}`] = {
    file: filename,
    generated: new Date().toISOString()
  };

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`   ✅ Manifest updated`);
}

// Get page number from command line
const pageNum = parseInt(process.argv[2]);
if (!pageNum || pageNum < 1 || pageNum > 10) {
  console.error('Usage: node scripts/generate-single-image.mjs <page-number>');
  console.error('  page-number: 1-10');
  process.exit(1);
}

generateImage(pageNum).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
