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
    Simple, stylized illustration suitable for a scrolling background behind a moving train.
    Child-friendly, not too busy, with soft colors and clean shapes.
    The design should work as a wide horizontal panorama (1200x400 viewport).
    Flat design style with subtle depth, no photorealism.
    Keep it calm and pleasant - the train is the focus, not the background.
    Output ONLY the raw SVG code, no markdown, no explanation.
  `;

  const backgrounds = [
    {
      filename: 'taipei_101_skyline',
      prompt: `Create a simple SVG panoramic background (viewBox="0 0 1200 400") showing Taipei 101 tower with surrounding modern buildings. ${styleGuide}
      Features: Taipei 101 prominent but not overwhelming, 3-4 other sleek modern buildings, soft sky gradient (blue to light blue), simple clouds.
      Colors: Use soft blues (#87CEEB, #B0E0E6), building grays (#E0E0E0, #C0C0C0), Taipei 101 with subtle green tint (#E8F4E8).
      Style: Flat geometric shapes, clean lines, minimal detail. Buildings should be simple rectangles with window patterns.`
    },
    {
      filename: 'taipei_temple',
      prompt: `Create a simple SVG panoramic background (viewBox="0 0 1200 400") showing a traditional Taiwanese temple (like Longshan Temple). ${styleGuide}
      Features: Traditional curved roof temple in center, incense smoke wisps, simple trees, lanterns hanging.
      Colors: Use warm reds (#E85D75, #DC143C), golden yellows (#FFD700, #F9D56E), temple greens (#7CB342), soft sky.
      Style: Simplified temple architecture, curved roofline, minimal ornate details. Focus on recognizable silhouette.`
    },
    {
      filename: 'taipei_night_market',
      prompt: `Create a simple SVG panoramic background (viewBox="0 0 1200 400") showing a Taiwanese night market scene. ${styleGuide}
      Features: Colorful stall awnings, hanging red lanterns, simple food stall silhouettes, evening sky gradient.
      Colors: Use warm oranges (#FF8C42), reds (#E85D75), yellows (#FFD93D), purples for evening sky (#9B59B6, #8E44AD).
      Style: Simple geometric stalls, round lanterns, no detailed people. Focus on atmosphere with lights and colors.`
    },
    {
      filename: 'taipei_riverside',
      prompt: `Create a simple SVG panoramic background (viewBox="0 0 1200 400") showing a riverside park with bicycle path. ${styleGuide}
      Features: Gentle river in foreground, bike path, simplified trees, distant city skyline, maybe a bridge.
      Colors: Use river blues (#48CAE4, #90E0EF), grass greens (#7CB342, #9CCC65), sky blues (#87CEEB).
      Style: Calm water with horizontal waves, simple tree silhouettes, clean modern bridge arch if included.`
    },
    {
      filename: 'taipei_mountain',
      prompt: `Create a simple SVG panoramic background (viewBox="0 0 1200 400") showing Yangmingshan mountain backdrop. ${styleGuide}
      Features: Layered mountain silhouettes (3-4 layers for depth), some simple trees on lower slopes, clear sky.
      Colors: Use mountain greens (#558B2F, #689F38, #7CB342) getting lighter with distance, sky gradient (#87CEEB to #E0F6FF).
      Style: Simple mountain shapes with parallax layers, minimal detail. Focus on peaceful natural scenery.`
    },
    {
      filename: 'taipei_mrt_elevated',
      prompt: `Create a simple SVG panoramic background (viewBox="0 0 1200 400") showing modern cityscape with elevated MRT tracks. ${styleGuide}
      Features: Elevated track structure with pillars, modern buildings, urban environment, maybe another MRT train in distance.
      Colors: Use building grays (#D0D0D0, #E8E8E8), track concrete (#A0A0A0), sky blues (#B0E0E6), MRT green/orange accents.
      Style: Clean geometric architecture, simple elevated track structure, minimal windows/detail. Modern and organized.`
    }
  ];

  console.log('Generating Taipei scenery backgrounds with Gemini 2.0 Flash...');
  console.log('Generating ' + backgrounds.length + ' backgrounds\n');

  for (let i = 0; i < backgrounds.length; i++) {
    const bg = backgrounds[i];
    await generateSVG(bg.prompt, bg.filename);

    if (i < backgrounds.length - 1) {
      console.log('Waiting 2 seconds...');
      await delay(2000);
    }
  }

  console.log('\n=== Taipei background generation complete! ===');
  console.log('Check assets folder for SVG files.');
  console.log('\nNext steps:');
  console.log('1. Review the generated SVGs and test them in the browser');
  console.log('2. Update the CSS to use these backgrounds in .scenery-container');
  console.log('3. Consider adding animated elements (birds, clouds, etc.)');
}

generateAll();
