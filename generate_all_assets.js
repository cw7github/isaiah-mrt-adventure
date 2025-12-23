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
      const errorText = await response.text();
      console.error('API Error: ' + response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract SVG from markdown code block
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      fs.writeFileSync('generated_assets/' + filename + '.svg', svgMatch[0]);
      console.log('Saved: ' + filename + '.svg');
      return svgMatch[0];
    } else {
      console.log('No SVG found in response');
      fs.writeFileSync('generated_assets/' + filename + '_raw.txt', content);
    }

    return content;
  } catch (error) {
    console.error('Error: ' + error.message);
    return null;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAll() {
  // Make sure assets directory exists
  if (!fs.existsSync('generated_assets')) {
    fs.mkdirSync('generated_assets');
  }

  const styleGuide = `Studio Ghibli/Miyazaki watercolor style with soft edges, warm colors, gentle gradients.
Kawaii-cute aesthetic suitable for children. Hand-drawn feel with organic shapes.
Use soft pastels and warm tones. Add subtle texture effects where appropriate.
Output ONLY the raw SVG code, no markdown, no explanation.`;

  const assets = [
    // Food Station Icons
    {
      filename: 'icon_apple',
      prompt: `Create an SVG (200x200) of a cute kawaii apple in ${styleGuide}
Features: Round red body with pink blush highlights, small happy eyes (curved lines), tiny smile, green leaf with stem on top. Colors: #E85D75 main, #C74B5F shadow, #7CB342 leaf.`
    },
    {
      filename: 'icon_drink',
      prompt: `Create an SVG (200x200) of a cute kawaii juice cup with straw in ${styleGuide}
Features: Tall rounded cup with condensation droplets, bendy straw, happy face on cup, orange juice color showing through. Colors: #FF9800 juice, #FFE0B2 cup, #4FC3F7 straw.`
    },
    {
      filename: 'icon_cupcake',
      prompt: `Create an SVG (200x200) of a cute kawaii cupcake in ${styleGuide}
Features: Swirled pink frosting top, brown paper wrapper with ridges, cherry on top, happy closed-eye smile. Colors: #F48FB1 frosting, #8D6E63 wrapper, #E53935 cherry.`
    },
    {
      filename: 'icon_pizza',
      prompt: `Create an SVG (200x200) of a cute kawaii pizza slice in ${styleGuide}
Features: Triangle slice with melty cheese dripping, pepperoni circles with happy faces, golden crust edge. Colors: #FFC107 cheese, #E53935 pepperoni, #D7A86E crust.`
    },
    {
      filename: 'icon_icecream',
      prompt: `Create an SVG (200x200) of a cute kawaii ice cream cone in ${styleGuide}
Features: Triple scoop (pink, mint, vanilla) with happy face on top scoop, waffle cone pattern, sprinkles. Colors: #F8BBD9 pink, #B2DFDB mint, #FFF9C4 vanilla, #D7A86E cone.`
    },
    {
      filename: 'icon_fish',
      prompt: `Create an SVG (200x200) of a cute kawaii fish in ${styleGuide}
Features: Friendly round fish with big sparkly eyes, flowing tail fin, small bubbles around it, scales pattern. Colors: #4FC3F7 body, #29B6F6 darker accents, #E1F5FE bubbles.`
    },
    {
      filename: 'icon_cheese',
      prompt: `Create an SVG (200x200) of a cute kawaii cheese wedge in ${styleGuide}
Features: Triangle cheese wedge with round holes, happy blushing face, slight shine on top. Colors: #FFC107 main, #FFB300 shadow, #FFF8E1 highlights.`
    },
    {
      filename: 'icon_noodles',
      prompt: `Create an SVG (200x200) of a cute kawaii bowl of noodles in ${styleGuide}
Features: Rounded bowl with wavy noodles peeking out, chopsticks, steam wisps above, small happy face on bowl. Colors: #FFAB91 bowl, #FFF3E0 noodles, #795548 chopsticks.`
    },
    // Train
    {
      filename: 'train_ghibli',
      prompt: `Create an SVG (400x150) of a magical Ghibli-style train car in ${styleGuide}
Features: Rounded friendly train car shape like a gentle creature, large round windows, warm cream and forest green colors, small decorative details, nature-inspired curves. Colors: #F5F5DC cream, #4CAF50 green accents, #8D6E63 brown details.`
    },
    // Mascot
    {
      filename: 'mascot_food_spirit',
      prompt: `Create an SVG (250x250) of a cute Totoro-like food spirit mascot in ${styleGuide}
Features: Round fluffy body in soft cream color, small pointy ears, big round eyes with sparkles, tiny happy mouth, holding a small apple. Like a friendly forest spirit that loves food. Colors: #FFF8E1 body, #D7CCC8 belly, #333 eyes, #E85D75 apple.`
    },
    // UI Elements
    {
      filename: 'button_bg',
      prompt: `Create an SVG (300x80) of a rounded button background in ${styleGuide}
Features: Soft rounded rectangle with watercolor-like edges, subtle gradient, small decorative flourishes at corners. Colors: #FFE0B2 to #FFCC80 gradient, #8D6E63 decorative elements.`
    },
    {
      filename: 'card_frame',
      prompt: `Create an SVG (320x400) of a decorative card frame in ${styleGuide}
Features: Rounded rectangle frame with nature-inspired decorative corners (small leaves and vines), soft shadow effect, paper-like texture inside. Colors: #FFFDE7 paper, #A5D6A7 leaf decorations, #8D6E63 vine accents.`
    },
    // Background Elements
    {
      filename: 'cloud_fluffy',
      prompt: `Create an SVG (200x100) of fluffy Ghibli-style clouds in ${styleGuide}
Features: Soft billowy cloud shape, multiple layers for depth, gentle curves, slightly pink-tinted highlights. Colors: #FFFFFF main, #F8BBD9 pink highlights, #E3F2FD blue shadows.`
    },
    {
      filename: 'tree_simple',
      prompt: `Create an SVG (150x200) of a simple Ghibli-style tree in ${styleGuide}
Features: Round fluffy foliage mass, slender brown trunk, organic asymmetric shape, small birds or leaves as details. Colors: #66BB6A foliage, #7CB342 highlights, #5D4037 trunk.`
    },
    {
      filename: 'hill_rolling',
      prompt: `Create an SVG (400x150) of rolling hills background in ${styleGuide}
Features: Gentle curved hill silhouettes in layers, soft gradients, small flower or grass details on front hill. Colors: #81C784 front, #A5D6A7 middle, #C8E6C9 back hills.`
    }
  ];

  console.log('Starting Miyazaki-style asset generation...\n');
  console.log('Generating ' + assets.length + ' assets\n');

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    await generateSVG(asset.prompt, asset.filename);

    // Small delay between requests to avoid rate limiting
    if (i < assets.length - 1) {
      console.log('Waiting 1 second before next request...');
      await delay(1000);
    }
  }

  console.log('\n=== Asset generation complete! ===');
  console.log('Check the generated_assets folder for all SVG files.');
}

generateAll();
