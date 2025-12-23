const fs = require('fs');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

async function generateImage(prompt, filename) {
  console.log('\n=== Generating: ' + filename + ' ===');
  console.log('Prompt:', prompt.substring(0, 100) + '...');

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
        modalities: ['text', 'image'],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error: ' + response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Response received');

    // Check for image in the response
    const message = data.choices?.[0]?.message;
    if (!message) {
      console.log('No message in response');
      console.log('Full response:', JSON.stringify(data, null, 2).substring(0, 500));
      return null;
    }

    // Check for images array in message (OpenRouter format)
    if (message.images && Array.isArray(message.images)) {
      for (const img of message.images) {
        if (img.type === 'image_url' && img.image_url?.url) {
          const dataUrl = img.image_url.url;
          const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const filepath = 'assets/train_scenes/' + filename + '.' + ext;
            fs.writeFileSync(filepath, buffer);
            console.log('Saved: ' + filepath + ' (' + buffer.length + ' bytes)');
            return filepath;
          }
        }
      }
    }

    // Handle multimodal response - look for image parts in content array
    if (message.content && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          const dataUrl = part.image_url.url;
          // Extract base64 data from data URL
          const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const filepath = 'assets/train_scenes/' + filename + '.' + ext;
            fs.writeFileSync(filepath, buffer);
            console.log('Saved: ' + filepath + ' (' + buffer.length + ' bytes)');
            return filepath;
          }
        }
        // Also check for inline_data format (Gemini native format)
        if (part.inline_data?.data) {
          const mimeType = part.inline_data.mime_type || 'image/png';
          const ext = mimeType.split('/')[1] || 'png';
          const base64Data = part.inline_data.data;
          const buffer = Buffer.from(base64Data, 'base64');
          const filepath = 'assets/train_scenes/' + filename + '.' + ext;
          fs.writeFileSync(filepath, buffer);
          console.log('Saved: ' + filepath + ' (' + buffer.length + ' bytes)');
          return filepath;
        }
      }
    }

    console.log('No image found in response');
    console.log('Full message structure:', JSON.stringify(message, null, 2).substring(0, 800));

    return null;
  } catch (error) {
    console.error('Error: ' + error.message);
    return null;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAll() {
  // Create output directory
  if (!fs.existsSync('assets/train_scenes')) {
    fs.mkdirSync('assets/train_scenes', { recursive: true });
  }

  const styleGuide = `
    Create a HIGH RESOLUTION (1920x1080 pixels minimum) wide panoramic cityscape image.

    IMPORTANT: Do NOT include any window frame, border, or vignette in the image.
    Just the pure landscape/cityscape filling the entire frame edge-to-edge.

    Style: High-quality 3D render like a Pixar movie or Studio Ghibli background. NOT photorealistic.
    Aesthetic: Stylized CGI with soft, warm lighting and gentle shadows. Slightly kawaii/cute feel.
    Mood: Cozy, inviting, magical, like a children's animated film establishing shot.
    Colors: Warm color palette - soft oranges, warm yellows, gentle greens, cozy browns.
    Lighting: Golden hour or soft afternoon light with warm glow.

    Composition: Wide establishing shot showing a broad vista. Zoom OUT to show more of the scene.
    The image should be sharp and detailed, suitable for display on high-resolution screens.

    No text, no watermarks, no people, no window frames or borders.
  `;

  const scenes = [
    {
      filename: 'taipei_101_day',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of stylized Taipei 101 and Xinyi District skyline at golden hour.
      Features: Taipei 101 tower in the center-distance, surrounded by cute rounded skyscrapers with warm glowing windows, fluffy stylized clouds across the sky, gentle mountains on the horizon. Show the full cityscape from a distance.
      Colors: Warm sunset oranges, peachy pinks, soft golden yellows, cozy atmosphere.`
    },
    {
      filename: 'taipei_riverside',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a cozy stylized river scene with lush greenery.
      Features: A wide calm river reflecting warm light, soft rounded trees lining both banks, a charming bridge in the mid-distance, gentle rolling hills extending to the horizon, expansive sky with fluffy clouds.
      Colors: Lush greens, warm turquoise water, golden sunlight, soft blue sky.`
    },
    {
      filename: 'taipei_temple',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a charming stylized traditional temple district.
      Features: Beautiful curved temple rooftops in the foreground/middle ground, warm red and gold colors, paper lanterns strung across, cute stylized buildings and trees spreading into the distance, mountains on horizon.
      Colors: Rich warm reds, golds, cream whites, soft blue sky with fluffy clouds.`
    },
    {
      filename: 'taipei_night_market',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a magical stylized night market district at twilight.
      Features: Wide street view with rows of warm glowing lanterns stretching into the distance, cozy food stall canopies, warm yellow and orange lights creating an inviting glow, beautiful purple-orange gradient twilight sky above.
      Colors: Warm amber lantern glow, soft purples and oranges in sky, cozy yellows and reds.`
    },
    {
      filename: 'taipei_mountain',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of dreamy stylized mountains (like Yangmingshan).
      Features: Layered mountain ranges with soft rounded peaks receding into misty distance, fluffy stylized trees in warm autumn colors in foreground, gentle fog creating atmospheric depth, maybe a tiny pagoda on a distant hill.
      Colors: Soft sage greens, warm oranges and yellows, misty lavender blues, cozy earth tones.`
    },
    {
      filename: 'taipei_mrt_elevated',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a cheerful stylized urban neighborhood.
      Features: Cute rounded apartment buildings spreading across the scene with colorful balconies and plants, elevated train tracks curving through the middle-distance, stylized trees and urban greenery throughout, fluffy white clouds in expansive sky.
      Colors: Soft pastels, warm cream buildings, green foliage, clear blue sky with warm undertones.`
    },
    {
      filename: 'taipei_harbor',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a cozy stylized harbor and waterfront.
      Features: Charming historic waterfront buildings stretching along the shore, cute colorful fishing boats dotting the calm harbor, soft mountain silhouettes in the background, warm afternoon light bathing everything.
      Colors: Warm brick reds and oranges, soft turquoise water, golden afternoon light, cream and brown earth tones.`
    },
    {
      filename: 'taipei_park',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a peaceful stylized urban park.
      Features: Tall trees with rounded foliage creating a beautiful canopy across the scene, dappled golden sunlight filtering through leaves, a serene winding pond with soft reflections, city buildings visible in the soft distance through the trees.
      Colors: Rich warm greens, golden dappled light, soft brown tree trunks, peaceful natural tones.`
    }
  ];

  console.log('Generating Taipei cityscape images with Gemini...');
  console.log('Generating ' + scenes.length + ' scenes\n');

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    await generateImage(scene.prompt, scene.filename);

    if (i < scenes.length - 1) {
      console.log('Waiting 3 seconds...');
      await delay(3000);
    }
  }

  console.log('\n=== Taipei cityscape generation complete! ===');
  console.log('Check assets/train_scenes folder for image files.');
}

generateAll();
