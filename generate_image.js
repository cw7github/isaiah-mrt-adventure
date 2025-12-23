const fs = require('fs');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

async function generateImage(prompt, filename) {
  console.log('Generating: ' + filename);
  console.log('Prompt: ' + prompt.substring(0, 80) + '...');

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
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'text' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error: ' + response.status + ' - ' + errorText);
      return null;
    }

    const data = await response.json();

    // Check for image data in various locations
    const message = data.choices?.[0]?.message;
    console.log('Message keys:', Object.keys(message || {}));

    // Check content for inline images
    if (message?.content) {
      if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === 'image' || part.type === 'image_url') {
            const imgData = part.image_url?.url || part.data || part.url;
            if (imgData) {
              fs.writeFileSync('generated_assets/' + filename + '.b64', imgData);
              console.log('Saved image data: ' + filename);
              return imgData;
            }
          }
        }
      }
      console.log('Content:', message.content.substring?.(0, 200) || JSON.stringify(message.content).substring(0, 200));
    }

    // Save full response for debugging
    fs.writeFileSync('generated_assets/' + filename + '_response.json', JSON.stringify(data, null, 2));
    console.log('Saved full response for debugging');

    return data;
  } catch (error) {
    console.error('Error: ' + error.message);
    return null;
  }
}

// Make sure assets directory exists
if (!fs.existsSync('generated_assets')) {
  fs.mkdirSync('generated_assets');
}

// Test with SVG generation request
generateImage(
  "Create an SVG code for a cute kawaii-style red apple character. The apple should have: a round red body with a gradient from bright red to darker red, cute dot eyes and a small smile, a small green leaf on top, soft blush marks on the cheeks. Output only the SVG code, no explanation.",
  "apple_icon"
).then(result => {
  console.log('Generation complete!');
});
