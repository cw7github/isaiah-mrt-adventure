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

    const message = data.choices?.[0]?.message;
    if (!message) {
      console.log('No message in response');
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
      filename: 'taipei_redbean_bakery',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a charming traditional Taiwanese bakery district in Taipei.
      Features: Rows of cute traditional bakery shops with warm glowing interiors, steaming red bean buns and bread visible through windows, traditional Chinese shop signs, warm street lamps, cobblestone streets, cozy neighborhood feel.
      Colors: Warm browns, cream whites, soft red accents, golden bakery lighting, cozy earth tones.
      This represents a traditional Taiwanese red bean bread bakery neighborhood.`
    },
    {
      filename: 'taipei_bubble_tea',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a vibrant modern Taipei bubble tea street.
      Features: Colorful bubble tea shops with neon signs, cute boba tea cups visible in shop windows, modern Taipei street with stylized buildings, young and trendy urban atmosphere, string lights and colorful awnings.
      Colors: Playful pastels - pink, purple, mint green, cream - mixed with warm evening lighting.
      This represents a trendy Taipei bubble tea district - very iconic Taiwan scene.`
    },
    {
      filename: 'taipei_burger',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a cheerful urban Taipei street food district.
      Features: Mix of modern and traditional food stalls, cute stylized street vendors, urban Taipei buildings in background, colorful food stall canopies, warm street food atmosphere.
      Colors: Warm yellows, oranges, reds from food stalls, soft blue sky, urban grays with warm accents.
      A lively but cozy Taipei street food scene.`
    },
    {
      filename: 'taipei_sushi',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a charming Japanese-influenced district in Taipei.
      Features: Cute sushi restaurants and Japanese-style buildings, paper lanterns, cherry blossom trees, traditional wooden architecture mixed with modern elements, peaceful canal or street scene.
      Colors: Soft pinks from cherry blossoms, warm wood browns, cream whites, soft blue sky.
      A peaceful Japanese-influenced neighborhood scene.`
    },
    {
      filename: 'taipei_chicken',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a cozy Taipei night market food alley specializing in fried chicken.
      Features: Warm glowing food stalls, hanging red lanterns, steam rising from cooking, cute stylized market stalls, traditional market atmosphere with modern touches.
      Colors: Warm amber and red from lanterns, golden fried food glow, purple-orange evening sky.
      A cozy and inviting night market chicken stall scene.`
    },
    {
      filename: 'taipei_smoothie',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a tropical fruit stand area in Taipei.
      Features: Colorful fruit stands with tropical fruits, fresh juice and smoothie stalls, palm trees, bright cheerful atmosphere, outdoor market with colorful umbrellas and awnings.
      Colors: Vibrant tropical colors - orange, yellow, green, pink - with bright sunny lighting.
      A fresh and tropical fruit market scene.`
    },
    {
      filename: 'taipei_teahouse',
      prompt: `${styleGuide}
      Scene: Wide panoramic view of a traditional Taiwanese tea house district, possibly in the mountains.
      Features: Traditional Chinese tea houses with curved roofs, misty mountains in background, terraced tea plantations, wooden architecture, peaceful serene atmosphere, soft fog.
      Colors: Sage greens, misty blues, warm wood browns, soft cream, peaceful natural tones.
      A serene traditional Taiwanese tea culture scene, like Jiufen or Maokong.`
    }
  ];

  console.log('Generating new Taipei station images...');
  console.log('Generating ' + scenes.length + ' scenes\n');

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    await generateImage(scene.prompt, scene.filename);

    if (i < scenes.length - 1) {
      console.log('Waiting 3 seconds...');
      await delay(3000);
    }
  }

  console.log('\n=== New station image generation complete! ===');
  console.log('Check assets/train_scenes folder for new image files.');
}

generateAll();
