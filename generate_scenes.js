const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-exp-1206:free'; // Using a model that supports image generation

// Scene definitions for each station
const sceneDefinitions = {
  fruit: [
    {
      name: 'fruit_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a charming outdoor fruit stand at a train station platform. Wooden crates overflowing with colorful fruits - red apples, orange oranges, yellow bananas. Soft warm sunlight filtering through a canvas awning. Whimsical, magical atmosphere with pastel colors. Horizontal landscape orientation. No text, no people. Child-friendly and calming aesthetic.'
    },
    {
      name: 'fruit_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical fruit orchard with fruit displays. Baskets of gleaming fresh fruits arranged beautifully. Soft dappled light through leaves. Warm golden hour lighting. Dreamy, peaceful atmosphere. Horizontal landscape. No text, no people. Miyazaki-inspired whimsical details.'
    },
    {
      name: 'fruit_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a cozy fruit stand counter with a wooden serving area. Beautiful arrangement of sliced fruits on a rustic plate. Warm, inviting atmosphere with soft pastel colors. Sunbeams streaming through windows. Horizontal landscape. No text, no people. Magical, comforting mood.'
    }
  ],
  drink: [
    {
      name: 'drink_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a whimsical juice bar entrance near train station. Colorful bottles of drinks visible through large windows. Pastel pink and blue tones. Soft warm lighting. Magical, inviting atmosphere. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki aesthetic.'
    },
    {
      name: 'drink_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical drink cafe. Shelves with colorful juice bottles, milk cartons, and tea containers. Soft glowing lights. Warm and cozy atmosphere with gentle colors. Horizontal landscape. No text, no people. Dreamy, peaceful Ghibli mood.'
    },
    {
      name: 'drink_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a cafe counter with drinks ready. Cold beverages with condensation droplets, warm tea steaming gently. Soft pastel lighting. Calm and refreshing atmosphere. Horizontal landscape. No text, no people. Whimsical Miyazaki-inspired details.'
    }
  ],
  bakery: [
    {
      name: 'bakery_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a charming bakery storefront near train platform. Display window showing cupcakes and pastries. Warm golden light glowing from inside. Soft pink and cream colors. Magical, welcoming atmosphere. Horizontal landscape orientation. No text, no people. Whimsical child-friendly aesthetic.'
    },
    {
      name: 'bakery_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical bakery. Shelves filled with cakes, pies, and warm buns. Soft flour dust in sunbeams. Warm browns, pinks, and creams. Cozy, sweet-smelling atmosphere. Horizontal landscape. No text, no people. Miyazaki-inspired dreamy mood.'
    },
    {
      name: 'bakery_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a bakery serving counter with fresh pastries. Beautiful cupcakes and treats on display. Warm oven glow in background. Soft pastel colors and golden lighting. Inviting, comforting atmosphere. Horizontal landscape. No text, no people. Magical Ghibli aesthetic.'
    }
  ],
  pizza: [
    {
      name: 'pizza_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a cozy pizzeria entrance near train station. Warm red brick oven visible through window. Golden light spilling out. Soft reds, oranges, and warm tones. Inviting, magical atmosphere. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki style.'
    },
    {
      name: 'pizza_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical pizza kitchen. Wood-fired oven glowing warmly. Pizza ingredients - tomatoes, cheese, basil. Warm golden and red tones. Cozy, appetizing atmosphere. Horizontal landscape. No text, no people. Whimsical Ghibli details.'
    },
    {
      name: 'pizza_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a pizzeria table with steaming hot pizza. Melted cheese glistening, steam rising. Warm candlelight ambiance. Soft warm colors - reds, golds, oranges. Comforting atmosphere. Horizontal landscape. No text, no people. Magical Miyazaki mood.'
    }
  ],
  icecream: [
    {
      name: 'icecream_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a whimsical ice cream parlor entrance near train station. Pastel pink and mint green storefront. Cool, refreshing atmosphere. Soft dreamy lighting. Horizontal landscape orientation. No text, no people. Magical child-friendly Ghibli aesthetic.'
    },
    {
      name: 'icecream_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical ice cream shop. Display freezers with colorful ice cream tubs - pink, brown, white, rainbow. Cool pastel colors. Dreamy, sweet atmosphere with soft lighting. Horizontal landscape. No text, no people. Miyazaki-inspired whimsy.'
    },
    {
      name: 'icecream_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of an ice cream parlor counter. Beautiful ice cream scoops in cones and cups. Soft pastel rainbow colors. Cool refreshing atmosphere with warm sunlight. Horizontal landscape. No text, no people. Magical, joyful Ghibli mood.'
    }
  ],
  fishshop: [
    {
      name: 'fishshop_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a charming fish market entrance near train station. Blue and white tiled storefront. Fresh ocean atmosphere. Cool blues and whites with warm accents. Clean, magical mood. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki aesthetic.'
    },
    {
      name: 'fishshop_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical fish market. Ice displays with fresh fish and shrimp. Aquarium-like atmosphere with soft blue lighting. Cool blues, silvers, and pinks. Fresh, clean feeling. Horizontal landscape. No text, no people. Whimsical Ghibli details.'
    },
    {
      name: 'fishshop_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a fish market counter with fresh seafood beautifully arranged. Shiny fish and pink shrimp on ice. Cool ocean blues with warm lighting. Fresh, inviting atmosphere. Horizontal landscape. No text, no people. Magical Miyazaki mood.'
    }
  ],
  cheese: [
    {
      name: 'cheese_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a quaint cheese shop entrance near train station. Rustic wooden storefront with cheese wheels visible. Warm yellow and cream colors. Cozy, welcoming atmosphere. Horizontal landscape orientation. No text, no people. Whimsical child-friendly Ghibli style.'
    },
    {
      name: 'cheese_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical cheese shop. Shelves with various cheese wheels and chunks - yellow, white, orange. Warm rustic lighting. Cozy farmhouse atmosphere with creams and golds. Horizontal landscape. No text, no people. Miyazaki-inspired charm.'
    },
    {
      name: 'cheese_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a cheese shop counter with cheese and sandwiches. Chunks of artisan cheese, fresh bread. Warm golden lighting. Homey, comforting atmosphere with soft yellows and creams. Horizontal landscape. No text, no people. Magical Ghibli aesthetic.'
    }
  ],
  noodle: [
    {
      name: 'noodle_arrival',
      prompt: 'Studio Ghibli style watercolor illustration of a traditional noodle house entrance near train station. Red lanterns and warm light from doorway. Steam visible. Warm reds, oranges, and browns. Inviting, cozy atmosphere. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki style.'
    },
    {
      name: 'noodle_exploring',
      prompt: 'Studio Ghibli style watercolor scene of the inside of a magical ramen shop. Steaming pots, noodle bowls, chopsticks. Warm atmospheric steam. Rich browns, reds, and warm tones. Cozy, appetizing mood. Horizontal landscape. No text, no people. Whimsical Ghibli details.'
    },
    {
      name: 'noodle_enjoying',
      prompt: 'Studio Ghibli style watercolor illustration of a noodle house counter with steaming bowls of ramen. Hot soup with steam rising beautifully. Warm golden and brown tones. Comforting, warm atmosphere. Horizontal landscape. No text, no people. Magical Miyazaki mood with food focus.'
    }
  ]
};

// Function to make API request for image generation
function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Generate an image: ${prompt}`
        }
      ],
      max_tokens: 1000
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/anthropic/isaiah-school',
        'X-Title': 'Isaiah MRT Food Adventure'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }

          // Try to extract image URL from response
          const content = response.choices?.[0]?.message?.content;
          if (content) {
            // Look for image URLs in the response
            const urlMatch = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i);
            if (urlMatch) {
              resolve(urlMatch[0]);
            } else {
              reject(new Error('No image URL found in response'));
            }
          } else {
            reject(new Error('No content in API response'));
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

// Function to download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(filepath, () => {}); // Delete incomplete file
      reject(error);
    });
  });
}

// Main function to generate all scenes
async function generateAllScenes() {
  const outputDir = path.join(__dirname, 'assets', 'scenes');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting scene generation for Isaiah\'s MRT Food Adventure...\n');
  console.log('Style: Studio Ghibli/Miyazaki watercolor backgrounds\n');
  console.log('Note: Using free model - if image generation fails, we may need to use a different approach.\n');

  for (const [station, scenes] of Object.entries(sceneDefinitions)) {
    console.log(`\n=== ${station.toUpperCase()} Station ===`);

    for (const scene of scenes) {
      const filename = `${scene.name}.png`;
      const filepath = path.join(outputDir, filename);

      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`✓ ${filename} already exists, skipping...`);
        continue;
      }

      console.log(`\nGenerating: ${filename}`);
      console.log(`Prompt: ${scene.prompt.substring(0, 100)}...`);

      try {
        console.log('Requesting image from API...');
        const imageUrl = await generateImage(scene.prompt);

        console.log('Downloading image...');
        await downloadImage(imageUrl, filepath);

        console.log(`✓ Successfully saved: ${filename}`);

        // Wait 2 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`✗ Failed to generate ${filename}: ${error.message}`);
        console.log('Continuing with next scene...');
      }
    }
  }

  console.log('\n=== Generation Complete ===');
  console.log(`Check the ${outputDir} directory for generated images.`);
  console.log('\nNote: Some images may have failed. You can re-run this script to retry failed images.');
}

// Alternative: Generate scene mapping for manual download
function generateSceneMapping() {
  console.log('\n=== SCENE GENERATION PROMPTS ===\n');
  console.log('If automated generation fails, use these prompts with an AI image generator like Midjourney or DALL-E:\n');

  for (const [station, scenes] of Object.entries(sceneDefinitions)) {
    console.log(`\n--- ${station.toUpperCase()} Station ---`);
    for (const scene of scenes) {
      console.log(`\nFilename: ${scene.name}.png`);
      console.log(`Prompt: ${scene.prompt}`);
      console.log('---');
    }
  }
}

// Check if user wants to see prompts only
if (process.argv.includes('--prompts-only')) {
  generateSceneMapping();
} else {
  generateAllScenes().catch(error => {
    console.error('Fatal error:', error);
    console.log('\nTo see all prompts for manual generation, run:');
    console.log('node generate_scenes.js --prompts-only');
  });
}
