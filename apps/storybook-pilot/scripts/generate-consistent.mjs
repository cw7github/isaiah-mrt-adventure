#!/usr/bin/env node
/**
 * Generate story images with STRICT character and style consistency
 *
 * Approach: Use page 1 as the "master style" reference for all subsequent pages
 * Include both character ref AND a previous page as style reference
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('❌ Error: OPENROUTER_API_KEY environment variable is not set');
  console.error('   Run: export OPENROUTER_API_KEY=your-key-here');
  process.exit(1);
}

// Very explicit character description to embed in EVERY prompt
const ISAIAH_DESC = `Isaiah is a 6-year-old ASIAN AMERICAN boy with SHORT BLACK HAIR, warm BROWN EYES, ROUND face with ROSY CHEEKS, wearing BLUE PAJAMAS with train pattern. He has a cute button nose and slightly chubby cheeks typical of a young child.`;

const CHEF_MARCO_DESC = `Chef Marco is a JOVIAL ITALIAN man in his 50s with a MAGNIFICENT CURLY BLACK MUSTACHE, OLIVE SKIN, ROTUND build, wearing a TALL WHITE CHEF HAT and WHITE CHEF JACKET with brass buttons.`;

const MOUSE_DESC = `Whiskers is a SMALL GREY MOUSE with VERY LARGE expressive BLACK EYES, PINK inner ears, long whiskers, and tiny pink paws.`;

const STYLE_DESC = `
MANDATORY STYLE - MUST MATCH EXACTLY:
- 3D rendered miniature diorama / tilt-shift photography look
- Pixar-quality CGI animation style
- Warm honey-butter (#E8C882) and amber (#C4956A) color palette
- Soft volumetric lighting like a cozy lamp
- Photorealistic textures on wood, brass, fabric
- NOT 2D, NOT watercolor, NOT anime, NOT cartoon
- Child-friendly, magical but grounded
- 16:9 horizontal landscape
- NO text or words in image`;

const PAGES = {
  1: {
    chars: ['isaiah'],
    scene: `SCENE: A child's cozy bedroom at midnight.
ENVIRONMENT: Warm wood-paneled walls, vintage toys on shelves, brass bedside lamp glowing warmly, quilted blanket with train pattern on the bed. Through a frost-covered window, magical train tracks glow blue in the moonlight.
ACTION: ${ISAIAH_DESC} Isaiah sits up in bed, looking out the window with wonder and curiosity, moonlight on his face.`
  },

  2: {
    chars: [],
    scene: `SCENE: Victorian train platform at midnight.
ENVIRONMENT: Cobblestone platform, wrought iron details, gas lamps with warm golden light, swirling magical mist. A magnificent GOLDEN steam locomotive emerges from the mist with ornate brass fittings, warm glowing windows, steam forming heart shapes.
ACTION: The magical pizza train arrives, no people in this scene - focus on the beautiful train and atmospheric platform.`
  },

  3: {
    chars: ['isaiah', 'chef_marco'],
    scene: `SCENE: Interior of luxurious vintage train car.
ENVIRONMENT: Warm mahogany wood paneling, brass fixtures, red velvet seats with gold trim, art deco ceiling details, vintage sconces with amber light. Starlit sky visible through windows.
ACTION: ${CHEF_MARCO_DESC} Chef Marco stands in the doorway with arms open welcomingly. ${ISAIAH_DESC} Isaiah looks up at him with amazement, still in his blue pajamas.`
  },

  4: {
    chars: ['chef_marco'],
    scene: `SCENE: Train kitchen car with magical ingredients.
ENVIRONMENT: Copper pots hanging from ceiling, colorful spice jars on wooden shelves, vintage brick pizza oven (unlit) in background, warm candlelight, rich wood textures.
ACTION: ${CHEF_MARCO_DESC} Chef Marco holds an ancient GLOWING SCROLL showing three mystical golden symbols. Dramatic warm lighting on the scroll.`
  },

  5: {
    chars: ['isaiah', 'mouse'],
    scene: `SCENE: Cozy corner of train kitchen.
ENVIRONMENT: Copper pots, wooden cutting boards, hanging herbs and garlic, ceramic jars, warm brick oven glowing softly, intimate amber lighting.
ACTION: ${ISAIAH_DESC} Isaiah kneels down offering bread to ${MOUSE_DESC} a small hungry mouse. The mouse looks up hopefully with big eyes.`
  },

  6: {
    chars: ['isaiah', 'mouse', 'chef_marco'],
    scene: `SCENE: Train kitchen bathed in magical golden light.
ENVIRONMENT: Same kitchen as before but now filled with floating golden particles and magical sparkles. Ethereal warm glow everywhere.
ACTION: A GLOWING GOLDEN CRUMB floats magically in the air, radiating light. ${ISAIAH_DESC} Isaiah watches in wonder. ${MOUSE_DESC} The mouse looks happy and grateful. ${CHEF_MARCO_DESC} Chef Marco watches from background with delight.`
  },

  7: {
    chars: ['isaiah'],
    scene: `SCENE: Dark mysterious train car.
ENVIRONMENT: Shadows dance on vintage wallpapered walls, dust motes in thin light beams, cool blue-grey tones, warm orange light spilling from doorway behind. Shadows form whimsical (not scary) creature shapes.
ACTION: ${ISAIAH_DESC} Isaiah (same Asian boy in blue pajamas) stands bravely in the doorway, warm light behind him, facing the playful shadows with determination.`
  },

  8: {
    chars: ['isaiah'],
    scene: `SCENE: Train car transforming from dark to light.
ENVIRONMENT: Shadows dissolving into beautiful BUTTERFLIES made of golden light, spiraling upward. Warm colors emerging from the darkness.
ACTION: ${ISAIAH_DESC} Isaiah stands confidently as light butterflies swirl around him. A bright ORANGE SPARK (the Courage Spark) floats near his heart, illuminating his amazed, happy face.`
  },

  9: {
    chars: ['isaiah', 'chef_marco'],
    scene: `SCENE: Beautiful garden car inside the train.
ENVIRONMENT: Heart-shaped flower beds with colorful blooms, glass ceiling with warm sunlight, brass planters, climbing vines, butterflies fluttering. A grand brass Dream Oven visible in background (unlit).
ACTION: ${CHEF_MARCO_DESC} Chef Marco gestures warmly, explaining something important. ${ISAIAH_DESC} Isaiah has a soft RED GLOW emanating from his chest - the Love Seed was within him all along.`
  },

  10: {
    chars: ['isaiah', 'chef_marco'],
    scene: `SCENE: Grand celebration in train kitchen.
ENVIRONMENT: Magnificent brass DREAM OVEN roaring with golden flames and magical fire. GOLDEN PIZZAS floating magically out of the oven. Confetti and sparkles everywhere. Triumphant, joyous atmosphere.
ACTION: ${ISAIAH_DESC} Isaiah and ${CHEF_MARCO_DESC} Chef Marco both celebrate with arms raised in joy, huge smiles on their faces.`
  }
};

async function loadImageAsBase64(filepath) {
  try {
    const data = await fs.readFile(filepath);
    const ext = path.extname(filepath).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${data.toString('base64')}`;
  } catch {
    return null;
  }
}

async function findExistingImage(pageNum) {
  const imagesDir = path.join(ROOT, 'assets', 'images');
  for (const ext of ['png', 'jpeg', 'jpg']) {
    const filepath = path.join(imagesDir, `page${pageNum}_scene.${ext}`);
    const base64 = await loadImageAsBase64(filepath);
    if (base64) return base64;
  }
  return null;
}

async function generatePage(pageNum, styleRefBase64 = null) {
  const pageData = PAGES[pageNum];
  if (!pageData) {
    console.error(`No data for page ${pageNum}`);
    return null;
  }

  console.log(`\n🎨 Generating Page ${pageNum}...`);

  // Load character reference
  const refsDir = path.join(ROOT, 'assets', 'images', 'refs');
  let isaiahRef = await loadImageAsBase64(path.join(refsDir, 'isaiah_ref.png'));

  // Build content array
  const content = [];

  // Add Isaiah reference if this page has Isaiah
  if (pageData.chars.includes('isaiah') && isaiahRef) {
    content.push({ type: 'image_url', image_url: { url: isaiahRef } });
    console.log(`   📎 Added Isaiah character reference`);
  }

  // Add style reference (page 1) if available and this isn't page 1
  if (styleRefBase64 && pageNum > 1) {
    content.push({ type: 'image_url', image_url: { url: styleRefBase64 } });
    console.log(`   🎨 Added style reference from page 1`);
  }

  // Build the prompt
  let prompt = '';

  if (content.length > 0) {
    prompt += `CRITICAL INSTRUCTIONS FOR REFERENCE IMAGES:\n`;
    if (pageData.chars.includes('isaiah') && isaiahRef) {
      prompt += `- Image 1 shows Isaiah's CHARACTER REFERENCE. You MUST make Isaiah look EXACTLY like this - same face, same hair, same pajamas, same art style.\n`;
    }
    if (styleRefBase64 && pageNum > 1) {
      prompt += `- The ${pageData.chars.includes('isaiah') && isaiahRef ? 'next' : 'first'} image shows the EXACT ART STYLE to use. Match this 3D rendered style PRECISELY.\n`;
    }
    prompt += `\nDO NOT deviate from these references. The character must be RECOGNIZABLE as the same person.\n\n`;
  }

  prompt += `Generate illustration for page ${pageNum} of a children's storybook.\n\n`;
  prompt += pageData.scene;
  prompt += `\n\n${STYLE_DESC}`;

  if (pageData.chars.includes('isaiah')) {
    prompt += `\n\nREMINDER: Isaiah is an ASIAN AMERICAN boy. He must have BLACK hair, BROWN eyes, and ASIAN facial features. He wears BLUE PAJAMAS with train pattern. DO NOT change his ethnicity or appearance.`;
  }

  content.push({ type: 'text', text: prompt });

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
        messages: [{ role: 'user', content }],
        modalities: ['text', 'image'],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const images = data.choices?.[0]?.message?.images;

    if (images?.[0]?.image_url?.url) {
      const match = images[0].image_url.url.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const format = match[1];
        const imageData = match[2];

        const imagesDir = path.join(ROOT, 'assets', 'images');
        const filename = `page${pageNum}_scene.${format}`;
        await fs.writeFile(path.join(imagesDir, filename), Buffer.from(imageData, 'base64'));
        console.log(`   ✅ Saved: ${filename}`);

        // Update manifest
        const manifestPath = path.join(imagesDir, 'manifest.json');
        let manifest = {};
        try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}
        manifest[`page${pageNum}`] = { file: filename, generated: new Date().toISOString() };
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        return images[0].image_url.url;
      }
    }
    throw new Error('No image in response');
  } catch (err) {
    console.error(`   ❌ Failed: ${err.message}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--page')) {
    const pageNum = parseInt(args[args.indexOf('--page') + 1]);
    // Use page 1 as style reference
    const styleRef = pageNum > 1 ? await findExistingImage(1) : null;
    await generatePage(pageNum, styleRef);
  } else if (args.includes('--all')) {
    console.log('🚂 Generating all pages with strict consistency...\n');

    // Generate page 1 first (this becomes our style reference)
    let styleRef = await generatePage(1, null);
    await new Promise(r => setTimeout(r, 3000));

    // If page 1 generation failed, try to use existing
    if (!styleRef) {
      styleRef = await findExistingImage(1);
    }

    // Generate remaining pages using page 1 as style reference
    for (let page = 2; page <= 10; page++) {
      await generatePage(page, styleRef);
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log('\n✅ All pages generated!');
  } else {
    console.log(`
Usage:
  node scripts/generate-consistent.mjs --page <N>   Generate single page
  node scripts/generate-consistent.mjs --all        Generate all pages
    `);
  }
}

main().catch(console.error);
