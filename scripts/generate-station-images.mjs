#!/usr/bin/env node
/**
 * Generate Ghibli-style station scene images using Gemini 3 Pro Image Preview
 *
 * Usage:
 *   node generate-station-images.mjs                    # Generate all missing images
 *   node generate-station-images.mjs --dry-run          # Show prompts without generating
 *   node generate-station-images.mjs --station rf_f1    # Generate for specific station
 *   node generate-station-images.mjs --force            # Regenerate all images
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const CONTENT_PACK_PATH = path.join(ROOT, 'content/cpa-grade1-ela/content-pack.v1.json');
const OUTPUT_DIR = path.join(ROOT, 'assets/station_scenes');

// Load API key from .env.local or environment
async function loadEnv() {
  try {
    const envPath = path.join(ROOT, '.env.local');
    const content = await fs.readFile(envPath, 'utf8');
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

let API_KEY = '';
const MODEL = 'google/gemini-3-pro-image-preview';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const stationFilter = args.find(arg => arg.startsWith('--station='))?.split('=')[1] ||
                      args.find((arg, i) => args[i-1] === '--station');

// Ghibli style base prompt
const GHIBLI_STYLE = `Studio Ghibli style watercolor illustration with soft watercolor textures, warm pastel colors, gentle lighting, hand-painted feel, whimsical and magical atmosphere, suitable for children, Miyazaki-inspired aesthetic`;

// Station-specific scene descriptions based on learning themes
const STATION_SCENES = {
  // Reading Foundation (RF) - Phonics & Word Recognition
  rf_f1_print_concepts: {
    theme: 'Library',
    prompt: `${GHIBLI_STYLE}. A cozy magical library corner at a train station. Warm wooden bookshelves with colorful children's books. Soft sunlight streaming through arched windows. A comfortable reading nook with cushions. Magical sparkles floating around open books. Horizontal landscape, no text, no people.`
  },
  rf_f2_blend_and_segment: {
    theme: 'Sound Lab',
    prompt: `${GHIBLI_STYLE}. A whimsical sound laboratory train car interior. Floating musical notes and letter tiles. Colorful headphones hanging on hooks. Gentle glowing orbs representing sounds. Cozy train seats with soft cushions. Warm golden lighting. Horizontal landscape, no text, no people.`
  },
  rf_f3_sound_positions: {
    theme: 'Detective Office',
    prompt: `${GHIBLI_STYLE}. A charming detective's study in a train station. Magnifying glasses and notebooks on a wooden desk. Soft lamp light. Maps and word charts on the wall. Cozy armchair. Mysterious but friendly atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f4_short_long_vowels: {
    theme: 'Music Room',
    prompt: `${GHIBLI_STYLE}. A magical music room at a station platform. Floating musical notes in rainbow colors. Soft instruments like xylophones and chimes. Gentle pastel curtains swaying. Warm afternoon light. Musical staffs decorating the walls. Horizontal landscape, no text, no people.`
  },
  rf_f5_consonant_blends: {
    theme: 'Bridge Station',
    prompt: `${GHIBLI_STYLE}. A charming wooden bridge connecting train platforms. Soft morning mist. Rainbow-colored tiles on the bridge path. Gentle flowing stream below. Cherry blossom petals floating. Warm sunrise colors. Horizontal landscape, no text, no people.`
  },
  rf_f6_read_short_words: {
    theme: 'Amusement Park',
    prompt: `${GHIBLI_STYLE}. A whimsical small amusement park near a train station. Gentle carousel with pastel colors. Soft balloon shapes floating. Warm festival lights. Cotton candy clouds. Cheerful but calm atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f7a_silent_e: {
    theme: 'Kite Field',
    prompt: `${GHIBLI_STYLE}. A peaceful hilltop meadow by a train station. Colorful kites flying in gentle breeze. Soft grass swaying. Fluffy clouds in blue sky. Warm afternoon sunlight. Wildflowers dotting the field. Horizontal landscape, no text, no people.`
  },
  rf_f7b_vowel_teams_ee_ea: {
    theme: 'Tree House',
    prompt: `${GHIBLI_STYLE}. A magical treehouse near a forest train stop. Soft green leaves with dappled sunlight. Cozy wooden platform. Gentle lanterns hanging from branches. Birds resting peacefully. Warm forest atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f7c_vowel_teams_ai_ay: {
    theme: 'Train Platform',
    prompt: `${GHIBLI_STYLE}. A charming vintage train platform. Soft clouds reflected in rain puddles. Rainbow appearing after rain. Warm brick station building. Gentle steam from a distant train. Cozy waiting benches. Horizontal landscape, no text, no people.`
  },
  rf_f7d_vowel_teams_oa_ow: {
    theme: 'Harbor',
    prompt: `${GHIBLI_STYLE}. A peaceful harbor near a coastal train station. Gentle boats with colorful sails. Soft waves lapping at the dock. Warm sunset colors reflecting on water. Seagulls resting. Cozy lighthouse in distance. Horizontal landscape, no text, no people.`
  },
  rf_f8_syllables_vowel_clues: {
    theme: 'Stepping Stones',
    prompt: `${GHIBLI_STYLE}. A magical garden path with colorful stepping stones. Soft moss and flowers between stones. Gentle butterflies hovering. Warm garden sunlight. Small pond with lily pads nearby. Peaceful forest path. Horizontal landscape, no text, no people.`
  },
  rf_f9_two_syllable_words: {
    theme: 'Building Blocks',
    prompt: `${GHIBLI_STYLE}. A cozy workshop train car with wooden building blocks. Soft colorful blocks stacked creatively. Warm lantern lighting. Comfortable work table. Tools hanging neatly. Friendly creative atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f10_word_endings: {
    theme: 'Workshop',
    prompt: `${GHIBLI_STYLE}. A charming craftsman's workshop at a train station. Soft wooden tools and materials. Warm workbench with gentle lighting. Hanging plants by windows. Cozy wood shavings on floor. Creative warm atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f11_sight_words_band_a: {
    theme: 'Eye Chart Room',
    prompt: `${GHIBLI_STYLE}. A magical eye doctor's room at a station. Soft glowing eye chart with friendly symbols. Comfortable examination chair. Warm lamp lighting. Colorful spectacles on display. Cozy medical office feel. Horizontal landscape, no text, no people.`
  },
  rf_f11_sight_words_band_b: {
    theme: 'Speaking Stage',
    prompt: `${GHIBLI_STYLE}. A charming small theater stage at a station. Soft velvet curtains in warm colors. Gentle spotlight glow. Comfortable audience seats. Small microphone on stand. Encouraging performance space. Horizontal landscape, no text, no people.`
  },
  rf_f11_sight_words_band_c: {
    theme: 'Number Garden',
    prompt: `${GHIBLI_STYLE}. A whimsical garden with number-shaped topiaries. Soft flower beds in rainbow order. Gentle fountain in center. Warm afternoon light. Butterflies and bees visiting flowers. Mathematical magic feel. Horizontal landscape, no text, no people.`
  },
  rf_f11_sight_words_band_d: {
    theme: 'Running Track',
    prompt: `${GHIBLI_STYLE}. A gentle running track near a train station. Soft grass alongside the track. Warm sunrise colors. Gentle morning mist. Small flags fluttering. Encouraging athletic atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f11_sight_words_band_e: {
    theme: 'Art Studio',
    prompt: `${GHIBLI_STYLE}. A cozy art studio train car. Soft easels with colorful canvases. Warm natural lighting from skylights. Paint palettes with rainbow colors. Comfortable stools. Creative inspiring atmosphere. Horizontal landscape, no text, no people.`
  },
  rf_f12_fluency_fix_words: {
    theme: 'Repair Shop',
    prompt: `${GHIBLI_STYLE}. A charming repair workshop at a station. Soft tools organized neatly. Warm workbench lighting. Gears and cogs decoratively displayed. Comfortable work area. Helpful fixing atmosphere. Horizontal landscape, no text, no people.`
  },

  // Reading Literature (RL) - Story Comprehension
  rl_l1_key_details_wh: {
    theme: 'Bakery Story Corner',
    prompt: `${GHIBLI_STYLE}. A cozy bakery with storytelling corner. Soft bread and pastries on display. Warm oven glow. Comfortable reading cushions. Gentle flour dust in sunbeams. Sweet homey atmosphere. Horizontal landscape, no text, no people.`
  },
  rl_l2_retell_message: {
    theme: 'Lost and Found',
    prompt: `${GHIBLI_STYLE}. A charming lost and found office at a station. Soft collection of friendly lost items. Warm desk lamp. Comfortable chair. Gentle mystery atmosphere. Helpful finding mood. Horizontal landscape, no text, no people.`
  },
  rl_l3_character_setting_events: {
    theme: 'Pet Shop',
    prompt: `${GHIBLI_STYLE}. A magical pet shop near a train station. Soft aquariums with colorful fish. Warm terrariums with gentle plants. Comfortable pet beds. Friendly animal atmosphere. Caring nurturing mood. Horizontal landscape, no text, no people.`
  },
  rl_l4_feeling_words: {
    theme: 'Picnic Meadow',
    prompt: `${GHIBLI_STYLE}. A peaceful picnic meadow by train tracks. Soft blanket with gentle picnic setup. Warm afternoon sunlight. Comfortable grassy area. Gentle breeze moving flowers. Happy relaxing atmosphere. Horizontal landscape, no text, no people.`
  },
  rl_l5_fiction_vs_nonfiction: {
    theme: 'Book Sorting Room',
    prompt: `${GHIBLI_STYLE}. A charming book sorting room at a library station. Soft stacks of different book types. Warm reading lamps. Comfortable sorting tables. Gentle organization atmosphere. Knowledge discovery feel. Horizontal landscape, no text, no people.`
  },
  rl_l6_narrator: {
    theme: 'Storyteller Nook',
    prompt: `${GHIBLI_STYLE}. A cozy storyteller's nook at a station. Soft rocking chair by fireplace. Warm flickering light. Comfortable cushions for listeners. Gentle book collection nearby. Narrative magic atmosphere. Horizontal landscape, no text, no people.`
  },
  rl_l7_pictures_and_words: {
    theme: 'Picture Book Corner',
    prompt: `${GHIBLI_STYLE}. A magical picture book corner at a park station. Soft oversized picture books displayed. Warm illustration colors everywhere. Comfortable viewing area. Gentle visual storytelling mood. Artistic imagination feel. Horizontal landscape, no text, no people.`
  },
  rl_l8_compare_characters: {
    theme: 'Music Practice Room',
    prompt: `${GHIBLI_STYLE}. A charming music practice room at a station. Soft instruments including violin and flute. Warm music stands. Comfortable practice chairs. Gentle sheet music displayed. Harmonious learning atmosphere. Horizontal landscape, no text, no people.`
  },
  rl_l9_stories_poems_prediction: {
    theme: 'Poetry Garden',
    prompt: `${GHIBLI_STYLE}. A peaceful poetry garden at a station. Soft scroll decorations with gentle designs. Warm garden lighting. Comfortable stone benches. Gentle water feature. Contemplative creative atmosphere. Horizontal landscape, no text, no people.`
  },

  // Reading Informational (RI) - Nonfiction Comprehension
  ri_n1_key_details_wh: {
    theme: 'Beehive Observatory',
    prompt: `${GHIBLI_STYLE}. A charming beehive observation station. Soft glass viewing panels showing bee activities. Warm honey-colored lighting. Comfortable observation seats. Gentle educational displays. Nature discovery atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n2_main_topic_details: {
    theme: 'Apple Orchard',
    prompt: `${GHIBLI_STYLE}. A peaceful apple orchard near a farm station. Soft apple trees with red and green fruit. Warm autumn sunlight. Comfortable picking baskets. Gentle falling leaves. Harvest learning atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n3_connections: {
    theme: 'Greenhouse',
    prompt: `${GHIBLI_STYLE}. A magical greenhouse at a botanical station. Soft sunlight through glass panels. Warm growing plants everywhere. Comfortable watering stations. Gentle sprouting seedlings. Nature connection atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n4_new_words: {
    theme: 'Dictionary Room',
    prompt: `${GHIBLI_STYLE}. A cozy dictionary study room at a station. Soft oversized dictionaries on stands. Warm reading lamps. Comfortable study desks. Gentle word exploration feel. Knowledge building atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n5_text_features: {
    theme: 'Map Room',
    prompt: `${GHIBLI_STYLE}. A charming map and chart room at a station. Soft colorful maps on walls. Warm globe on table. Comfortable viewing chairs. Gentle navigation tools. Exploration discovery atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n6_pictures_vs_words: {
    theme: 'Photo Gallery',
    prompt: `${GHIBLI_STYLE}. A peaceful photo gallery at a station. Soft framed photographs on walls. Warm gallery lighting. Comfortable viewing benches. Gentle visual documentation feel. Visual learning atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n7_reasons_support_main_idea: {
    theme: 'Puzzle Room',
    prompt: `${GHIBLI_STYLE}. A magical puzzle room at a station. Soft jigsaw pieces and brain teasers. Warm table lighting. Comfortable thinking chairs. Gentle problem-solving displays. Logical thinking atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n8_compare_two_texts: {
    theme: 'Comparison Corner',
    prompt: `${GHIBLI_STYLE}. A charming comparison study corner. Soft side-by-side displays. Warm balanced lighting. Comfortable dual desks. Gentle analytical tools. Critical thinking atmosphere. Horizontal landscape, no text, no people.`
  },
  ri_n9_nonfiction_prediction: {
    theme: 'Weather Station',
    prompt: `${GHIBLI_STYLE}. A cozy weather observation station. Soft weather instruments on display. Warm prediction charts. Comfortable observation deck. Gentle clouds visible through windows. Scientific curiosity atmosphere. Horizontal landscape, no text, no people.`
  },

  // Language (L) - Grammar & Vocabulary
  l_g1_capitals_endmarks: {
    theme: 'Typography Studio',
    prompt: `${GHIBLI_STYLE}. A charming typography studio at a station. Soft letter stamps and blocks. Warm printing press glow. Comfortable work benches. Gentle ink and paper supplies. Writing craft atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g2_nouns: {
    theme: 'Naming Museum',
    prompt: `${GHIBLI_STYLE}. A magical museum of objects at a station. Soft labeled display cases. Warm museum lighting. Comfortable viewing areas. Gentle collection of everyday items. Categorization learning atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g3_plurals_verbs: {
    theme: 'Group Activity Room',
    prompt: `${GHIBLI_STYLE}. A cheerful group activity room at a station. Soft pairs and groups of objects. Warm social lighting. Comfortable gathering spaces. Gentle action-oriented displays. Plural understanding atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g4_pronouns: {
    theme: 'Mirror Room',
    prompt: `${GHIBLI_STYLE}. A magical mirror room at a station. Soft reflective surfaces showing different perspectives. Warm gentle lighting. Comfortable standing areas. Gentle self-reflection atmosphere. Identity understanding mood. Horizontal landscape, no text, no people.`
  },
  l_g5_verb_tense: {
    theme: 'Clock Tower',
    prompt: `${GHIBLI_STYLE}. A charming clock tower room at a station. Soft antique clocks showing different times. Warm ticking atmosphere. Comfortable time-themed seating. Gentle past-present-future displays. Time awareness mood. Horizontal landscape, no text, no people.`
  },
  l_g6_adjectives_determiners: {
    theme: 'Description Gallery',
    prompt: `${GHIBLI_STYLE}. A colorful description gallery at a station. Soft paintings showing sizes, colors, textures. Warm artistic lighting. Comfortable viewing spots. Gentle sensory exploration displays. Descriptive language atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g7_conjunctions_prepositions: {
    theme: 'Connection Bridge',
    prompt: `${GHIBLI_STYLE}. A magical bridge with connecting pathways at a station. Soft rope and plank bridges. Warm lantern lighting. Comfortable resting platforms. Gentle linking architecture. Connection understanding atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g8_sentence_types_compound: {
    theme: 'Construction Zone',
    prompt: `${GHIBLI_STYLE}. A charming construction play area at a station. Soft building blocks and connectors. Warm workshop lighting. Comfortable building tables. Gentle assembly activities. Sentence building atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g9_commas_dates_lists: {
    theme: 'Calendar Room',
    prompt: `${GHIBLI_STYLE}. A cozy calendar and planning room at a station. Soft calendars with marked dates. Warm organizational lighting. Comfortable planning desks. Gentle list-making supplies. Time organization atmosphere. Horizontal landscape, no text, no people.`
  },
  l_g10_spelling_strategies: {
    theme: 'Spelling Bee Stage',
    prompt: `${GHIBLI_STYLE}. A charming spelling bee stage at a station. Soft letter tiles and alphabet displays. Warm spotlight glow. Comfortable contestant podiums. Gentle encouraging atmosphere. Spelling mastery mood. Horizontal landscape, no text, no people.`
  },
  l_v1_context_word_parts: {
    theme: 'Word Lab',
    prompt: `${GHIBLI_STYLE}. A magical word laboratory at a station. Soft word part tiles and combinations. Warm experimental lighting. Comfortable work stations. Gentle discovery equipment. Word building atmosphere. Horizontal landscape, no text, no people.`
  },
  l_v2_categories: {
    theme: 'Sorting Station',
    prompt: `${GHIBLI_STYLE}. A charming sorting and organizing station. Soft colored bins and baskets. Warm organization lighting. Comfortable sorting tables. Gentle categorization activities. Classification learning atmosphere. Horizontal landscape, no text, no people.`
  },
  l_v3_real_life_word_use: {
    theme: 'Home Corner',
    prompt: `${GHIBLI_STYLE}. A cozy home corner display at a station. Soft miniature home items. Warm domestic lighting. Comfortable home-like seating. Gentle everyday objects displayed. Real-world connection atmosphere. Horizontal landscape, no text, no people.`
  },
  l_v4_shades_of_meaning: {
    theme: 'Rainbow Room',
    prompt: `${GHIBLI_STYLE}. A magical rainbow gradient room at a station. Soft color transitions everywhere. Warm spectrum lighting. Comfortable color-themed seating. Gentle shade variations displayed. Nuance understanding atmosphere. Horizontal landscape, no text, no people.`
  },
  l_v5_use_new_words: {
    theme: 'Word Garden',
    prompt: `${GHIBLI_STYLE}. A beautiful word garden at a station. Soft word flowers blooming. Warm garden sunlight. Comfortable garden benches. Gentle vocabulary plants growing. New word cultivation atmosphere. Horizontal landscape, no text, no people.`
  },

  // Review Stations
  review_sprint_1: {
    theme: 'Review Station 1',
    prompt: `${GHIBLI_STYLE}. A charming first checkpoint station on a train journey. Soft celebration decorations. Warm accomplishment lighting. Comfortable rest area. Gentle progress indicators. Achievement celebration atmosphere. Horizontal landscape, no text, no people.`
  },
  review_sprint_2: {
    theme: 'Review Station 2',
    prompt: `${GHIBLI_STYLE}. A peaceful second checkpoint station. Soft milestone markers. Warm congratulatory lighting. Comfortable reflection area. Gentle learning journey displays. Progress celebration atmosphere. Horizontal landscape, no text, no people.`
  },
  review_sprint_3: {
    theme: 'Review Station 3',
    prompt: `${GHIBLI_STYLE}. A magical third checkpoint station. Soft achievement badges displayed. Warm victory lighting. Comfortable celebration seating. Gentle mastery indicators. Near-completion celebration atmosphere. Horizontal landscape, no text, no people.`
  },
  review_sprint_4: {
    theme: 'Grand Finale Station',
    prompt: `${GHIBLI_STYLE}. A grand finale celebration station. Soft confetti and streamers. Warm golden celebration lighting. Comfortable victory seating. Gentle trophy and medal displays. Complete mastery celebration atmosphere. Horizontal landscape, no text, no people.`
  }
};

async function generateImage(stationId, prompt) {
  console.log(`\n=== Generating: ${stationId} ===`);
  console.log(`Prompt: ${prompt.substring(0, 80)}...`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://isaiah-mrt-adventure.vercel.app',
        'X-Title': 'Isaiah MRT Food Adventure'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        modalities: ['text', 'image']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}: ${errorText}`);
      return false;
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    // Check for inline_data format (Gemini's native format)
    if (message?.content && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image' && part.source?.data) {
          const format = part.source.media_type?.split('/')[1] || 'png';
          const buffer = Buffer.from(part.source.data, 'base64');
          const filename = `${stationId}.${format}`;
          await fs.writeFile(path.join(OUTPUT_DIR, filename), buffer);
          console.log(`  Saved: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
          return true;
        }
      }
    }

    // Check for images array format
    if (message?.images && Array.isArray(message.images)) {
      for (let i = 0; i < message.images.length; i++) {
        const img = message.images[i];
        if (img.type === 'image_url' && img.image_url?.url) {
          const dataUrl = img.image_url.url;
          const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);

          if (matches) {
            const format = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `${stationId}.${format}`;
            await fs.writeFile(path.join(OUTPUT_DIR, filename), buffer);
            console.log(`  Saved: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
            return true;
          }
        }
      }
    }

    console.log('  No images found in response');
    console.log('  Response structure:', JSON.stringify(message, null, 2).substring(0, 500));
    return false;

  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  await loadEnv();
  API_KEY = process.env.OPENROUTER_API_KEY || '';

  if (!API_KEY && !dryRun) {
    console.error('Missing OPENROUTER_API_KEY (set it in .env.local or environment)');
    process.exit(1);
  }

  // Load content pack to get station list
  const contentPack = JSON.parse(await fs.readFile(CONTENT_PACK_PATH, 'utf8'));
  const stationIds = contentPack.stationOrder || Object.keys(contentPack.stations);

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Filter stations
  let stationsToProcess = stationIds;

  if (stationFilter) {
    stationsToProcess = stationsToProcess.filter(id => id.includes(stationFilter));
    console.log(`Filtering to stations matching: ${stationFilter}`);
  }

  // Check which need generation
  const stationsNeedingImages = [];
  for (const stationId of stationsToProcess) {
    if (!STATION_SCENES[stationId]) {
      console.warn(`  Warning: No scene definition for ${stationId}`);
      continue;
    }

    if (!force) {
      // Check if image already exists
      const possibleExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      let exists = false;
      for (const ext of possibleExtensions) {
        try {
          await fs.access(path.join(OUTPUT_DIR, `${stationId}.${ext}`));
          exists = true;
          break;
        } catch { /* doesn't exist */ }
      }
      if (exists) continue;
    }

    stationsNeedingImages.push(stationId);
  }

  console.log(`\nStation Image Generation`);
  console.log(`========================`);
  console.log(`Total stations: ${stationsToProcess.length}`);
  console.log(`Need generation: ${stationsNeedingImages.length}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  if (stationsNeedingImages.length === 0) {
    console.log('\n All images already exist. Use --force to regenerate.');
    return;
  }

  if (dryRun) {
    console.log('\nDRY RUN - Showing prompts:\n');
    for (const stationId of stationsNeedingImages) {
      const scene = STATION_SCENES[stationId];
      const stationName = contentPack.stations[stationId]?.name || stationId;
      console.log(`${stationId} (${stationName})`);
      console.log(`  Theme: ${scene.theme}`);
      console.log(`  Prompt: ${scene.prompt.substring(0, 100)}...`);
      console.log();
    }
    return;
  }

  // Generate images
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < stationsNeedingImages.length; i++) {
    const stationId = stationsNeedingImages[i];
    const scene = STATION_SCENES[stationId];
    const stationName = contentPack.stations[stationId]?.name || stationId;

    console.log(`\n[${i + 1}/${stationsNeedingImages.length}] ${stationName}`);

    const success = await generateImage(stationId, scene.prompt);
    if (success) {
      generated++;
    } else {
      failed++;
    }

    // Rate limiting (2 seconds between requests)
    if (i < stationsNeedingImages.length - 1) {
      console.log('  Waiting 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Generation Complete!`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(50)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
