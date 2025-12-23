#!/usr/bin/env node
/**
 * Generate Ghibli-style math station scene images using Gemini 3 Pro Image Preview
 * Run with: node scripts/generate-math-station-images.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'assets/math_station_scenes');

let API_KEY = '';
const MODEL = 'google/gemini-3-pro-image-preview';

async function loadEnv() {
  try {
    const content = await fs.readFile(path.join(ROOT, '.env.local'), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* ignore */ }
}

const GHIBLI_STYLE = `Studio Ghibli style watercolor illustration with soft watercolor textures, warm pastel colors, gentle lighting, hand-painted feel, whimsical and magical atmosphere, suitable for children, Miyazaki-inspired aesthetic, Taipei train station theme`;

const MATH_STATION_SCENES = {
  // OA - Operations & Algebraic Thinking
  oa_counting_up_down: {
    name: 'Counting Train Platform',
    prompt: `${GHIBLI_STYLE}. A magical train platform with a large colorful number line painted on the wall showing 0-20. Soft warm lighting. Cute number markers. A friendly train in the background. Cozy waiting benches. Horizontal landscape, no text, no people.`
  },
  oa_add_word_problems: {
    name: 'Fruit Stand Addition',
    prompt: `${GHIBLI_STYLE}. A charming fruit stand at a train station with baskets of colorful apples, oranges, and bananas. Soft morning light. Wooden crates stacked neatly. Price cards without text. Warm inviting atmosphere. Horizontal landscape, no text, no people.`
  },
  oa_sub_word_problems: {
    name: 'Noodle Shop Subtraction',
    prompt: `${GHIBLI_STYLE}. A cozy noodle shop near a train platform with steaming bowls displayed. Warm lantern lighting. Wooden counter with chopsticks. Soft steam rising. Comfortable seating area. Horizontal landscape, no text, no people.`
  },
  oa_add_three_numbers: {
    name: 'Bakery Three Numbers',
    prompt: `${GHIBLI_STYLE}. A magical bakery with three display cases showing cupcakes, bread, and cookies. Warm oven glow. Soft flour dust in sunbeams. Three cute ingredient jars. Cozy baking atmosphere. Horizontal landscape, no text, no people.`
  },
  oa_fact_families: {
    name: 'Bubble Tea Fact Families',
    prompt: `${GHIBLI_STYLE}. A whimsical bubble tea shop with colorful drinks in groups. Soft pastel decor. Three sizes of cups displayed together. Tapioca pearls in jars. Gentle neon-like glow. Horizontal landscape, no text, no people.`
  },
  oa_add_facts_20: {
    name: 'Dumpling Addition Facts',
    prompt: `${GHIBLI_STYLE}. A cozy dumpling restaurant with bamboo steamers stacked. Steam rising gently. Groups of dumplings arranged on plates. Warm kitchen glow. Soft wooden interior. Horizontal landscape, no text, no people.`
  },
  oa_sub_facts_20: {
    name: 'Rice Bowl Subtraction Facts',
    prompt: `${GHIBLI_STYLE}. A peaceful rice bowl shop with neat rows of bowls. Soft steam from fresh rice. Toppings in small dishes. Warm homey lighting. Clean wooden counter. Horizontal landscape, no text, no people.`
  },
  oa_equal_sign: {
    name: 'Balance Scale Station',
    prompt: `${GHIBLI_STYLE}. A magical balance scale display at a station. Large friendly balance scale in center. Colorful weights and objects. Soft glowing atmosphere. Educational but whimsical feel. Horizontal landscape, no text, no people.`
  },
  oa_missing_number: {
    name: 'Mystery Number Station',
    prompt: `${GHIBLI_STYLE}. A charming detective-themed corner at a train station. Magnifying glass, question mark decorations. Soft mysterious lighting. Number tiles scattered playfully. Cozy investigation nook. Horizontal landscape, no text, no people.`
  },

  // NBT - Numbers & Base Ten
  nbt_count_to_120: {
    name: 'Train Number Station',
    prompt: `${GHIBLI_STYLE}. A grand train station hall with platform numbers visible. Large decorative number display. Trains in background. Warm golden lighting. High arched ceiling. Horizontal landscape, no text, no people.`
  },
  nbt_tens_and_ones: {
    name: 'Dumpling Counting Shop',
    prompt: `${GHIBLI_STYLE}. A dumpling shop with dumplings arranged in groups of ten on steamer trays. Individual dumplings on the side. Warm steam. Bamboo steamers stacked. Soft kitchen lighting. Horizontal landscape, no text, no people.`
  },
  nbt_teen_numbers: {
    name: 'Boba Tea Counter',
    prompt: `${GHIBLI_STYLE}. A colorful boba tea counter with drinks arranged showing ten plus extras. Soft pastel cups. One group of ten, some singles. Cheerful shop atmosphere. Gentle lighting. Horizontal landscape, no text, no people.`
  },
  nbt_count_by_tens: {
    name: 'Egg Tart Tower',
    prompt: `${GHIBLI_STYLE}. A bakery with egg tarts arranged in tower formation by tens. Golden tarts stacked on tiered stands. Warm oven glow. Soft pastry atmosphere. Cozy display shelves. Horizontal landscape, no text, no people.`
  },
  nbt_compare_numbers: {
    name: 'Noodle Length Shop',
    prompt: `${GHIBLI_STYLE}. A noodle shop with different length noodles displayed. Comparison scales visible. Long and short noodle bundles. Warm cooking atmosphere. Soft steam. Horizontal landscape, no text, no people.`
  },
  nbt_add_no_regroup: {
    name: 'Fruit Stand Two-Digit',
    prompt: `${GHIBLI_STYLE}. A large fruit market stall with fruits grouped in tens. Baskets of ten apples, loose oranges. Soft morning market light. Wooden display stands. Cheerful atmosphere. Horizontal landscape, no text, no people.`
  },
  nbt_add_with_regroup: {
    name: 'Steamed Bun Kitchen',
    prompt: `${GHIBLI_STYLE}. A busy steamed bun kitchen with buns in steamers. Some steamers full (ten), some partial. Warm steamy atmosphere. Bamboo steamers everywhere. Cozy kitchen glow. Horizontal landscape, no text, no people.`
  },
  nbt_ten_more_less: {
    name: 'Elevator Number Buttons',
    prompt: `${GHIBLI_STYLE}. A charming train station elevator interior with button panel. Soft glowing buttons. Decorative floor indicator. Warm wood paneling. Gentle lighting. Horizontal landscape, no text, no people.`
  },
  nbt_subtract_tens: {
    name: 'Rice Ball Subtraction',
    prompt: `${GHIBLI_STYLE}. A rice ball shop with onigiri arranged in groups. Some empty spaces where rice balls were. Soft seaweed wrapping. Warm shop lighting. Neat wooden shelves. Horizontal landscape, no text, no people.`
  },

  // MD - Measurement & Data
  md_compare_lengths: {
    name: 'Noodle House Lengths',
    prompt: `${GHIBLI_STYLE}. A noodle house with different length noodles hanging. Long, medium, short noodles displayed. Soft drying area lighting. Comparison visible. Traditional atmosphere. Horizontal landscape, no text, no people.`
  },
  md_measure_length: {
    name: 'Cookie Shop Measuring',
    prompt: `${GHIBLI_STYLE}. A cookie shop with cookies and measuring tools. Ruler-shaped cookie cutters. Different sized cookies. Warm baking atmosphere. Soft golden lighting. Horizontal landscape, no text, no people.`
  },
  md_tell_time: {
    name: 'Train Schedule Station',
    prompt: `${GHIBLI_STYLE}. A train station with a beautiful large clock. Departure board area without text. Soft station lighting. Comfortable waiting area. Clock as centerpiece. Horizontal landscape, no text, no people.`
  },
  md_organize_data: {
    name: 'Snack Survey Station',
    prompt: `${GHIBLI_STYLE}. A snack stand with items arranged in organized rows. Different snacks in neat columns. Soft display lighting. Survey-like arrangement. Cheerful atmosphere. Horizontal landscape, no text, no people.`
  },
  md_interpret_data: {
    name: 'Food Court Data',
    prompt: `${GHIBLI_STYLE}. A food court with different stalls visible. Items displayed in graph-like arrangements. Soft overhead lighting. Multiple food options. Organized colorful layout. Horizontal landscape, no text, no people.`
  },

  // G - Geometry
  g_shape_attributes: {
    name: 'Shape Station',
    prompt: `${GHIBLI_STYLE}. A magical shape learning corner at a station. Large friendly geometric shapes displayed. Circles, squares, triangles as decorations. Soft colorful lighting. Educational playful feel. Horizontal landscape, no text, no people.`
  },
  g_2d_shapes: {
    name: 'Food Shapes',
    prompt: `${GHIBLI_STYLE}. A food display with shape-themed items. Round cookies, square crackers, triangle sandwiches. Soft display lighting. Geometric food arrangement. Warm cafe atmosphere. Horizontal landscape, no text, no people.`
  },
  g_3d_shapes: {
    name: 'Drink Station 3D',
    prompt: `${GHIBLI_STYLE}. A drink station with 3D shaped containers. Cylindrical cups, cube ice, sphere fruits. Soft refreshing lighting. Geometric drink display. Cool pastel atmosphere. Horizontal landscape, no text, no people.`
  },
  g_compose_shapes: {
    name: 'Tile Workshop',
    prompt: `${GHIBLI_STYLE}. A tile crafting workshop with mosaic pieces. Different shapes combining into patterns. Soft workshop lighting. Colorful tile pieces. Creative building atmosphere. Horizontal landscape, no text, no people.`
  },
  g_halves_quarters: {
    name: 'Pizza Party Fractions',
    prompt: `${GHIBLI_STYLE}. A pizza shop with pizzas cut into halves and quarters. Neat slices displayed. Warm pizza oven glow. Cheese melting. Sharing party atmosphere. Horizontal landscape, no text, no people.`
  },

  // Review stations
  review_math_sprint_1: {
    name: 'Math Review Station 1',
    prompt: `${GHIBLI_STYLE}. A celebration checkpoint at a train station. Math-themed decorations with shapes and numbers. Soft festive lighting. Achievement ribbons. Progress celebration atmosphere. Horizontal landscape, no text, no people.`
  },
  review_math_sprint_2: {
    name: 'Math Grand Finale',
    prompt: `${GHIBLI_STYLE}. A grand finale station with confetti and celebration. Math symbols as decorations. Golden trophy display. Warm celebration lighting. Accomplishment atmosphere. Horizontal landscape, no text, no people.`
  }
};

async function generateImage(stationId, prompt) {
  console.log(`Generating: ${stationId}`);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://isaiah-mrt-adventure.vercel.app',
        'X-Title': 'Isaiah MRT Math Adventure'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        modalities: ['text', 'image']
      })
    });

    if (!response.ok) {
      console.error(`  API Error ${response.status}`);
      return false;
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    // Check for inline_data format
    if (message?.content && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image' && part.source?.data) {
          const format = part.source.media_type?.split('/')[1] || 'png';
          const buffer = Buffer.from(part.source.data, 'base64');
          await fs.writeFile(path.join(OUTPUT_DIR, `${stationId}.${format}`), buffer);
          console.log(`  ✓ Saved ${stationId}.${format} (${Math.round(buffer.length/1024)}KB)`);
          return true;
        }
      }
    }

    // Check for images array format
    if (message?.images && Array.isArray(message.images)) {
      for (const img of message.images) {
        if (img.type === 'image_url' && img.image_url?.url) {
          const matches = img.image_url.url.match(/^data:image\/(\w+);base64,(.+)$/);
          if (matches) {
            const buffer = Buffer.from(matches[2], 'base64');
            await fs.writeFile(path.join(OUTPUT_DIR, `${stationId}.${matches[1]}`), buffer);
            console.log(`  ✓ Saved ${stationId}.${matches[1]} (${Math.round(buffer.length/1024)}KB)`);
            return true;
          }
        }
      }
    }

    console.log(`  ✗ No image in response`);
    return false;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  await loadEnv();
  API_KEY = process.env.OPENROUTER_API_KEY || '';

  if (!API_KEY) {
    console.error('Missing OPENROUTER_API_KEY');
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const stationFilter = process.argv.find(a => a.startsWith('--station='))?.split('=')[1];
  let stations = Object.entries(MATH_STATION_SCENES);

  if (stationFilter) {
    stations = stations.filter(([id]) => id.includes(stationFilter));
  }

  // Check which need generation
  const toGenerate = [];
  for (const [id, scene] of stations) {
    const exists = await Promise.any([
      fs.access(path.join(OUTPUT_DIR, `${id}.png`)).then(() => true),
      fs.access(path.join(OUTPUT_DIR, `${id}.jpeg`)).then(() => true),
      fs.access(path.join(OUTPUT_DIR, `${id}.jpg`)).then(() => true)
    ]).catch(() => false);

    if (!exists) toGenerate.push([id, scene]);
  }

  console.log(`\nMath Station Image Generation`);
  console.log(`==============================`);
  console.log(`Total: ${stations.length}, Need generation: ${toGenerate.length}\n`);

  if (toGenerate.length === 0) {
    console.log('All images exist!');
    return;
  }

  let success = 0, failed = 0;
  for (const [id, scene] of toGenerate) {
    if (await generateImage(id, scene.prompt)) success++;
    else failed++;
  }

  console.log(`\nComplete! Success: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
