const fs = require('fs');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

async function generateImage(prompt) {
  console.log('Generating image with Gemini 3 Pro Image Preview...\n');

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

  const data = await response.json();

  // Save full response for analysis
  fs.writeFileSync('generated_assets/image_response.json', JSON.stringify(data, null, 2));

  console.log('Response status:', response.status);
  console.log('Model:', data.model);
  console.log('Provider:', data.provider);

  const message = data.choices?.[0]?.message;
  if (message) {
    console.log('\nMessage keys:', Object.keys(message));
    console.log('Content type:', typeof message.content);
    console.log('Content length:', message.content?.length || 0);

    // Check for inline_data in content array
    if (Array.isArray(message.content)) {
      console.log('\nContent is array with', message.content.length, 'items');
      message.content.forEach((item, i) => {
        console.log('Item', i, 'type:', item.type);
        if (item.inline_data) {
          console.log('  Has inline_data! MIME:', item.inline_data.mime_type);
          const imgData = item.inline_data.data;
          fs.writeFileSync('generated_assets/image_output.png', Buffer.from(imgData, 'base64'));
          console.log('  Saved image to image_output.png!');
        }
        if (item.image_url) {
          console.log('  Has image_url!', item.image_url.url?.substring(0, 50));
        }
      });
    }

    // Check reasoning_details for image data
    if (message.reasoning_details) {
      console.log('\nReasoning details:', message.reasoning_details.length, 'items');
      message.reasoning_details.forEach((item, i) => {
        console.log('Detail', i, '- type:', item.type, 'format:', item.format);
      });
    }
  }

  console.log('\nFull response saved to generated_assets/image_response.json');
}

generateImage("Generate an image of a cute red apple with a happy smiling face, in Studio Ghibli watercolor art style, soft pastel colors, white background");
