#!/usr/bin/env python3
"""
Scene Generator for Isaiah's MRT Food Adventure
Generates Ghibli-style backgrounds using OpenAI DALL-E or other APIs
"""

import os
import json
import time
import requests
from pathlib import Path

# Configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
OUTPUT_DIR = Path(__file__).parent / 'assets' / 'scenes'

# Scene definitions
SCENES = {
    'fruit': [
        {
            'name': 'fruit_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a charming outdoor fruit stand at a train station platform. Wooden crates overflowing with colorful fruits - red apples, orange oranges, yellow bananas. Soft warm sunlight filtering through a canvas awning. Whimsical, magical atmosphere with pastel colors. Horizontal landscape orientation. No text, no people. Child-friendly and calming aesthetic.'
        },
        {
            'name': 'fruit_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical fruit orchard with fruit displays. Baskets of gleaming fresh fruits arranged beautifully. Soft dappled light through leaves. Warm golden hour lighting. Dreamy, peaceful atmosphere. Horizontal landscape. No text, no people. Miyazaki-inspired whimsical details.'
        },
        {
            'name': 'fruit_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a cozy fruit stand counter with a wooden serving area. Beautiful arrangement of sliced fruits on a rustic plate. Warm, inviting atmosphere with soft pastel colors. Sunbeams streaming through windows. Horizontal landscape. No text, no people. Magical, comforting mood.'
        }
    ],
    'drink': [
        {
            'name': 'drink_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a whimsical juice bar entrance near train station. Colorful bottles of drinks visible through large windows. Pastel pink and blue tones. Soft warm lighting. Magical, inviting atmosphere. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki aesthetic.'
        },
        {
            'name': 'drink_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical drink cafe. Shelves with colorful juice bottles, milk cartons, and tea containers. Soft glowing lights. Warm and cozy atmosphere with gentle colors. Horizontal landscape. No text, no people. Dreamy, peaceful Ghibli mood.'
        },
        {
            'name': 'drink_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a cafe counter with drinks ready. Cold beverages with condensation droplets, warm tea steaming gently. Soft pastel lighting. Calm and refreshing atmosphere. Horizontal landscape. No text, no people. Whimsical Miyazaki-inspired details.'
        }
    ],
    'bakery': [
        {
            'name': 'bakery_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a charming bakery storefront near train platform. Display window showing cupcakes and pastries. Warm golden light glowing from inside. Soft pink and cream colors. Magical, welcoming atmosphere. Horizontal landscape orientation. No text, no people. Whimsical child-friendly aesthetic.'
        },
        {
            'name': 'bakery_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical bakery. Shelves filled with cakes, pies, and warm buns. Soft flour dust in sunbeams. Warm browns, pinks, and creams. Cozy, sweet-smelling atmosphere. Horizontal landscape. No text, no people. Miyazaki-inspired dreamy mood.'
        },
        {
            'name': 'bakery_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a bakery serving counter with fresh pastries. Beautiful cupcakes and treats on display. Warm oven glow in background. Soft pastel colors and golden lighting. Inviting, comforting atmosphere. Horizontal landscape. No text, no people. Magical Ghibli aesthetic.'
        }
    ],
    'pizza': [
        {
            'name': 'pizza_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a cozy pizzeria entrance near train station. Warm red brick oven visible through window. Golden light spilling out. Soft reds, oranges, and warm tones. Inviting, magical atmosphere. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki style.'
        },
        {
            'name': 'pizza_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical pizza kitchen. Wood-fired oven glowing warmly. Pizza ingredients - tomatoes, cheese, basil. Warm golden and red tones. Cozy, appetizing atmosphere. Horizontal landscape. No text, no people. Whimsical Ghibli details.'
        },
        {
            'name': 'pizza_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a pizzeria table with steaming hot pizza. Melted cheese glistening, steam rising. Warm candlelight ambiance. Soft warm colors - reds, golds, oranges. Comforting atmosphere. Horizontal landscape. No text, no people. Magical Miyazaki mood.'
        }
    ],
    'icecream': [
        {
            'name': 'icecream_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a whimsical ice cream parlor entrance near train station. Pastel pink and mint green storefront. Cool, refreshing atmosphere. Soft dreamy lighting. Horizontal landscape orientation. No text, no people. Magical child-friendly Ghibli aesthetic.'
        },
        {
            'name': 'icecream_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical ice cream shop. Display freezers with colorful ice cream tubs - pink, brown, white, rainbow. Cool pastel colors. Dreamy, sweet atmosphere with soft lighting. Horizontal landscape. No text, no people. Miyazaki-inspired whimsy.'
        },
        {
            'name': 'icecream_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of an ice cream parlor counter. Beautiful ice cream scoops in cones and cups. Soft pastel rainbow colors. Cool refreshing atmosphere with warm sunlight. Horizontal landscape. No text, no people. Magical, joyful Ghibli mood.'
        }
    ],
    'fishshop': [
        {
            'name': 'fishshop_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a charming fish market entrance near train station. Blue and white tiled storefront. Fresh ocean atmosphere. Cool blues and whites with warm accents. Clean, magical mood. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki aesthetic.'
        },
        {
            'name': 'fishshop_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical fish market. Ice displays with fresh fish and shrimp. Aquarium-like atmosphere with soft blue lighting. Cool blues, silvers, and pinks. Fresh, clean feeling. Horizontal landscape. No text, no people. Whimsical Ghibli details.'
        },
        {
            'name': 'fishshop_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a fish market counter with fresh seafood beautifully arranged. Shiny fish and pink shrimp on ice. Cool ocean blues with warm lighting. Fresh, inviting atmosphere. Horizontal landscape. No text, no people. Magical Miyazaki mood.'
        }
    ],
    'cheese': [
        {
            'name': 'cheese_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a quaint cheese shop entrance near train station. Rustic wooden storefront with cheese wheels visible. Warm yellow and cream colors. Cozy, welcoming atmosphere. Horizontal landscape orientation. No text, no people. Whimsical child-friendly Ghibli style.'
        },
        {
            'name': 'cheese_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical cheese shop. Shelves with various cheese wheels and chunks - yellow, white, orange. Warm rustic lighting. Cozy farmhouse atmosphere with creams and golds. Horizontal landscape. No text, no people. Miyazaki-inspired charm.'
        },
        {
            'name': 'cheese_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a cheese shop counter with cheese and sandwiches. Chunks of artisan cheese, fresh bread. Warm golden lighting. Homey, comforting atmosphere with soft yellows and creams. Horizontal landscape. No text, no people. Magical Ghibli aesthetic.'
        }
    ],
    'noodle': [
        {
            'name': 'noodle_arrival',
            'prompt': 'Studio Ghibli style watercolor illustration of a traditional noodle house entrance near train station. Red lanterns and warm light from doorway. Steam visible. Warm reds, oranges, and browns. Inviting, cozy atmosphere. Horizontal landscape orientation. No text, no people. Child-friendly Miyazaki style.'
        },
        {
            'name': 'noodle_exploring',
            'prompt': 'Studio Ghibli style watercolor scene of the inside of a magical ramen shop. Steaming pots, noodle bowls, chopsticks. Warm atmospheric steam. Rich browns, reds, and warm tones. Cozy, appetizing mood. Horizontal landscape. No text, no people. Whimsical Ghibli details.'
        },
        {
            'name': 'noodle_enjoying',
            'prompt': 'Studio Ghibli style watercolor illustration of a noodle house counter with steaming bowls of ramen. Hot soup with steam rising beautifully. Warm golden and brown tones. Comforting, warm atmosphere. Horizontal landscape. No text, no people. Magical Miyazaki mood with food focus.'
        }
    ]
}


def generate_with_openrouter_flux(prompt, output_path):
    """
    Generate image using OpenRouter with Flux model
    """
    try:
        url = "https://openrouter.ai/api/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://github.com/isaiah-school",
            "X-Title": "Isaiah MRT Food Adventure",
            "Content-Type": "application/json"
        }

        # Try with image-capable model
        data = {
            "model": "black-forest-labs/flux-1.1-pro",  # This model supports images
            "messages": [
                {
                    "role": "user",
                    "content": f"Generate a beautiful image: {prompt}"
                }
            ]
        }

        print(f"  Requesting image generation...")
        response = requests.post(url, headers=headers, json=data, timeout=60)

        if response.status_code == 200:
            result = response.json()
            # The response format may vary - need to check what's returned
            print(f"  Response received: {json.dumps(result, indent=2)[:500]}")

            # Try to extract image URL from response
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '')

            # Look for image URLs in markdown format or direct URLs
            import re
            url_pattern = r'https?://[^\s\)"\'>]+'
            urls = re.findall(url_pattern, content)

            if urls:
                image_url = urls[0]
                print(f"  Found image URL: {image_url[:50]}...")

                # Download the image
                img_response = requests.get(image_url, timeout=30)
                if img_response.status_code == 200:
                    with open(output_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"  ✓ Saved to {output_path.name}")
                    return True
                else:
                    print(f"  ✗ Failed to download image: {img_response.status_code}")
            else:
                print(f"  ✗ No image URL found in response")
                print(f"  Content: {content[:200]}")
        else:
            print(f"  ✗ API error: {response.status_code}")
            print(f"  Response: {response.text[:500]}")

    except Exception as e:
        print(f"  ✗ Error: {str(e)}")

    return False


def generate_all_scenes():
    """Generate all scene backgrounds"""

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Isaiah's MRT Food Adventure - Scene Generator")
    print("=" * 60)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print(f"Total scenes to generate: {sum(len(scenes) for scenes in SCENES.values())}")
    print("\nStyle: Studio Ghibli/Miyazaki watercolor backgrounds")
    print("\n" + "=" * 60 + "\n")

    stats = {'success': 0, 'failed': 0, 'skipped': 0}

    for station, scenes in SCENES.items():
        print(f"\n{'='*60}")
        print(f"  {station.upper()} STATION")
        print(f"{'='*60}\n")

        for scene in scenes:
            filename = f"{scene['name']}.png"
            output_path = OUTPUT_DIR / filename

            # Skip if already exists
            if output_path.exists():
                print(f"✓ {filename} - Already exists, skipping")
                stats['skipped'] += 1
                continue

            print(f"\n{filename}")
            print(f"  Prompt: {scene['prompt'][:80]}...")

            # Try to generate
            success = generate_with_openrouter_flux(scene['prompt'], output_path)

            if success:
                stats['success'] += 1
            else:
                stats['failed'] += 1
                print(f"  ⚠ Failed to generate {filename}")

            # Rate limiting - wait between requests
            time.sleep(3)

    # Print summary
    print("\n" + "=" * 60)
    print("GENERATION SUMMARY")
    print("=" * 60)
    print(f"✓ Successful:  {stats['success']}")
    print(f"✗ Failed:      {stats['failed']}")
    print(f"⊘ Skipped:     {stats['skipped']}")
    print(f"Total:         {sum(stats.values())}")
    print("=" * 60)

    if stats['failed'] > 0:
        print("\n⚠ Some images failed to generate.")
        print("See SCENE_GENERATION_GUIDE.md for manual generation options.")

    if stats['success'] > 0:
        print(f"\n✓ Generated images are saved in: {OUTPUT_DIR}")


def list_prompts():
    """Just list all prompts without generating"""
    print("\n" + "=" * 70)
    print("SCENE GENERATION PROMPTS")
    print("=" * 70)

    for station, scenes in SCENES.items():
        print(f"\n{'='*70}")
        print(f"{station.upper()} STATION ({len(scenes)} scenes)")
        print('='*70)

        for i, scene in enumerate(scenes, 1):
            print(f"\n{i}. {scene['name']}.png")
            print(f"   {scene['prompt']}")

    print("\n" + "=" * 70)
    print(f"Total: {sum(len(scenes) for scenes in SCENES.values())} scenes")
    print("=" * 70)


if __name__ == '__main__':
    import sys

    if '--list' in sys.argv or '--prompts' in sys.argv:
        list_prompts()
    else:
        print("\n⚠ NOTE: Automated image generation may not work with free API tiers.")
        print("If generation fails, see SCENE_GENERATION_GUIDE.md for manual options.\n")

        response = input("Continue with automated generation? (y/n): ")
        if response.lower() == 'y':
            generate_all_scenes()
        else:
            print("\nCancelled. To see prompts, run:")
            print("  python3 generate_scenes_openai.py --list")
