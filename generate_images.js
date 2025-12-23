const fs = require('fs');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

async function generateImage(prompt, filename) {
  console.log('\n=== Generating: ' + filename + ' ===');
  console.log('Prompt: ' + prompt.substring(0, 60) + '...');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://isaiah-mrt-adventure.vercel.app',
        'X-Title': 'Isaiah MRT Food Adventure'
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      return null;
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    // Extract images from the response
    if (message?.images && Array.isArray(message.images)) {
      console.log('Found ' + message.images.length + ' image(s)');

      for (let i = 0; i < message.images.length; i++) {
        const img = message.images[i];
        if (img.type === 'image_url' && img.image_url?.url) {
          // Extract base64 data from data URL
          const dataUrl = img.image_url.url;
          const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);

          if (matches) {
            const format = matches[1]; // jpeg, png, etc.
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            const imgFilename = message.images.length > 1
              ? filename + '_' + i + '.' + format
              : filename + '.' + format;

            fs.writeFileSync('generated_assets/' + imgFilename, buffer);
            console.log('Saved: ' + imgFilename + ' (' + Math.round(buffer.length / 1024) + ' KB)');
          }
        }
      }
      return true;
    } else {
      console.log('No images in response');
      return false;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAll() {
  if (!fs.existsSync('generated_assets')) {
    fs.mkdirSync('generated_assets');
  }

  const styleGuide = "Studio Ghibli/Hayao Miyazaki art style with soft watercolor textures, warm pastel colors, gentle lighting, hand-painted feel, whimsical and magical atmosphere, suitable for children";

  const assets = [
    // Food Icons for each station
    {
      filename: 'apple_ghibli',
      prompt: `Create an image of a cute kawaii red apple character in ${styleGuide}. The apple has a happy smiling face with rosy cheeks, a small green leaf on top, soft shadows and highlights. White/cream background.`
    },
    {
      filename: 'drink_ghibli',
      prompt: `Create an image of a cute kawaii juice cup with straw in ${styleGuide}. A tall glass with orange juice, condensation droplets, a bendy straw, and a happy face. Soft dreamy lighting. White/cream background.`
    },
    {
      filename: 'cupcake_ghibli',
      prompt: `Create an image of a cute kawaii cupcake in ${styleGuide}. Pink swirled frosting, brown paper wrapper, a cherry on top, happy closed-eye smile. Magical sparkles around it. White/cream background.`
    },
    {
      filename: 'pizza_ghibli',
      prompt: `Create an image of a cute kawaii pizza slice in ${styleGuide}. Triangle slice with melty golden cheese, cheerful pepperoni with tiny faces, steaming hot. Warm cozy feeling. White/cream background.`
    },
    {
      filename: 'icecream_ghibli',
      prompt: `Create an image of a cute kawaii ice cream cone in ${styleGuide}. Three scoops (pink strawberry, mint green, vanilla) with a happy face, waffle cone, colorful sprinkles. Dreamy pastel colors. White/cream background.`
    },
    {
      filename: 'fish_ghibli',
      prompt: `Create an image of a cute kawaii fish character in ${styleGuide}. A friendly round fish with big sparkly eyes like Ponyo, blue-turquoise colors, small bubbles around it. Ocean magical feeling. White/cream background.`
    },
    {
      filename: 'cheese_ghibli',
      prompt: `Create an image of a cute kawaii cheese wedge in ${styleGuide}. Golden yellow Swiss cheese with holes, blushing happy face, warm glowing colors. Cozy and inviting. White/cream background.`
    },
    {
      filename: 'noodles_ghibli',
      prompt: `Create an image of a cute kawaii bowl of ramen noodles in ${styleGuide}. A steaming bowl like in Ponyo, wavy noodles, chopsticks, rising steam wisps, happy bowl face. Warm and comforting. White/cream background.`
    },
    // Mascot
    {
      filename: 'mascot_ghibli',
      prompt: `Create an image of a cute Totoro-like food spirit mascot in ${styleGuide}. A round fluffy cream-colored creature with small pointy ears, big friendly eyes with sparkles, tiny happy mouth, holding a small red apple. Like a forest spirit that loves food. Magical aura around it. White/cream background.`
    },
    // Train
    {
      filename: 'train_ghibli',
      prompt: `Create an image of a magical Ghibli-style train car in ${styleGuide}. A whimsical rounded train like the one in Spirited Away, cream and forest green colors, large round windows, nature-inspired decorations, gentle and friendly looking. Side view. White/cream background.`
    }
  ];

  console.log('Starting Miyazaki-style image generation with Gemini 3 Pro...');
  console.log('Generating ' + assets.length + ' images\n');

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    await generateImage(asset.prompt, asset.filename);

    if (i < assets.length - 1) {
      console.log('Waiting 2 seconds...');
      await delay(2000);
    }
  }

  console.log('\n=== Image generation complete! ===');
  console.log('Check generated_assets folder for images.');
}

generateAll();
