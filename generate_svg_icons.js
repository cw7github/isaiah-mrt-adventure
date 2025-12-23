const fs = require('fs');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

async function generateSVG(prompt, filename) {
  console.log('\n=== Generating: ' + filename + ' ===');

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
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('API Error: ' + response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract SVG from markdown code block
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      fs.writeFileSync('assets/' + filename + '.svg', svgMatch[0]);
      console.log('Saved: ' + filename + '.svg');
      return svgMatch[0];
    } else {
      console.log('No SVG found in response');
      console.log('Content preview:', content.substring(0, 200));
    }

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
  const styleGuide = `
    Kawaii/cute style, simple flat design for small icons.
    Use soft pastel colors with warm tones.
    Simple shapes, no complex details.
    Small happy face (dot eyes, tiny smile) where appropriate.
    Output ONLY the raw SVG code, no markdown, no explanation.
  `;

  const icons = [
    {
      filename: 'icon_fruit',
      prompt: `Create a simple SVG icon (64x64) of a cute red apple. ${styleGuide}
      Features: Round shape, small leaf, tiny happy face (two dots for eyes, small curve for smile).
      Colors: #E85D75 for apple, #7CB342 for leaf.`
    },
    {
      filename: 'icon_drink',
      prompt: `Create a simple SVG icon (64x64) of a cute juice cup with straw. ${styleGuide}
      Features: Simple cup shape, straw, tiny happy face on cup.
      Colors: #FF9800 for juice, #4FC3F7 for straw.`
    },
    {
      filename: 'icon_bakery',
      prompt: `Create a simple SVG icon (64x64) of a cute cupcake. ${styleGuide}
      Features: Simple cupcake with swirled frosting, tiny happy face.
      Colors: #F48FB1 for frosting, #8D6E63 for wrapper.`
    },
    {
      filename: 'icon_pizza',
      prompt: `Create a simple SVG icon (64x64) of a cute pizza slice. ${styleGuide}
      Features: Triangle slice with pepperoni dots, tiny happy face.
      Colors: #FFC107 for cheese, #E53935 for pepperoni.`
    },
    {
      filename: 'icon_icecream',
      prompt: `Create a simple SVG icon (64x64) of a cute ice cream cone. ${styleGuide}
      Features: Simple scoop on cone, tiny happy face on scoop.
      Colors: #F8BBD9 for ice cream, #D7A86E for cone.`
    },
    {
      filename: 'icon_fish',
      prompt: `Create a simple SVG icon (64x64) of a cute fish. ${styleGuide}
      Features: Simple round fish with tail, tiny happy face, small bubbles.
      Colors: #4FC3F7 for fish, #E1F5FE for bubbles.`
    },
    {
      filename: 'icon_cheese',
      prompt: `Create a simple SVG icon (64x64) of a cute cheese wedge. ${styleGuide}
      Features: Triangle cheese with holes, tiny happy face.
      Colors: #FFC107 for cheese, #FFB300 for darker parts.`
    },
    {
      filename: 'icon_noodle',
      prompt: `Create a simple SVG icon (64x64) of a cute bowl of noodles. ${styleGuide}
      Features: Simple bowl with wavy noodles, tiny happy face on bowl, steam wisps.
      Colors: #FFAB91 for bowl, #FFF3E0 for noodles.`
    }
  ];

  console.log('Generating simple SVG icons with Gemini 2.0 Flash...');
  console.log('Generating ' + icons.length + ' icons\n');

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    await generateSVG(icon.prompt, icon.filename);

    if (i < icons.length - 1) {
      console.log('Waiting 1 second...');
      await delay(1000);
    }
  }

  console.log('\n=== SVG icon generation complete! ===');
  console.log('Check assets folder for SVG files.');
}

generateAll();
