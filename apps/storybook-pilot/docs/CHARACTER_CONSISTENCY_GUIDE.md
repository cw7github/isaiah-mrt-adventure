# Character Consistency Guide for Gemini 3 Pro Image Preview (Nano Banana Pro)

## Overview

Gemini 3 Pro Image Preview (codenamed "Nano Banana Pro") supports advanced character consistency features through reference images and prompt engineering. This guide documents best practices for maintaining consistent characters across varied environments, outfits, and expressions.

---

## Core Capabilities

### Reference Image Limits
- **Up to 14 total reference images** per request
- **Up to 5 human/character references** for identity preservation
- **Up to 6 high-fidelity object references**

### What Can Be Preserved
- Facial structure and features
- Eye color, hair style/color
- Skin tone and distinctive markings
- Proportions and body type
- Art style and rendering approach
- Signature design elements (tattoos, accessories, etc.)

### What Can Be Varied
- Environment/background
- Lighting conditions
- Pose and body position
- Expressions and emotions
- Clothing/outfits
- Camera angle and framing

---

## Best Practices

### 1. Create a Character "Anchor" Reference

Before generating story scenes, create a **character sheet** that serves as the visual anchor:

```
Prompt Template:
"Character reference sheet for [CHARACTER NAME].
[DETAILED DESCRIPTION including ethnicity, age, hair, eyes, face shape, distinguishing features].

Show: front view, 3/4 view, profile view, and [2-3 expressions].
Clean white background, consistent studio lighting.
[ART STYLE DESCRIPTION].
High resolution, detailed."
```

**Example for Isaiah:**
```
"Character reference sheet for Isaiah, a 6-year-old Asian American boy.
Short black hair slightly messy, warm brown eyes, round friendly face with rosy cheeks,
button nose, child proportions (head-to-body ratio 1:5).
Wearing blue pajamas with train pattern.

Show: front view, 3/4 view, profile view, and expressions (curious, brave, happy).
Clean white background, consistent warm studio lighting.
3D rendered Pixar-style CGI animation aesthetic.
High resolution, detailed."
```

### 2. The "Anchor & Pivot" Workflow

**Step 1: Generate the Anchor**
Create and save a character reference sheet.

**Step 2: Inject the Reference**
Include the anchor image in every subsequent request.

**Step 3: Pivot to New Scene**
Write a new prompt that explicitly references the anchor:

```
"REFERENCE IMAGE shows [CHARACTER NAME]'s appearance.
Maintain EXACT facial features, hair, and proportions.

Generate: [CHARACTER NAME] [ACTION] in [NEW ENVIRONMENT].
[SCENE DESCRIPTION].
[LIGHTING].
[ART STYLE - same as reference]."
```

### 3. Prompt Structure for Consistency

Use this formula: `[Identity Lock] + [Subject/Action] + [Environment] + [Style Lock]`

**Identity Lock Phrases:**
- "featuring the same character shown in the reference image"
- "maintain exact facial features, hair style, and proportions"
- "keep all core design elements consistent"
- "identity clearly recognizable from the reference"
- "DO NOT change ethnicity, face structure, or distinguishing features"

**Style Lock Phrases:**
- "match the exact art style from the reference"
- "same 3D rendering style, lighting approach, and color palette"
- "consistent with the established visual style"

### 4. Multi-Reference Strategy

For scenes with multiple characters, order references by importance:

```
Content Array Order:
1. Primary character reference (Isaiah)
2. Secondary character reference (Chef Marco)
3. Style reference (previous successful scene)
4. Text prompt with explicit role assignments
```

**Role Assignment in Prompt:**
```
"REFERENCE IMAGES:
- Image 1: Isaiah's character reference (use for face, hair, pajamas)
- Image 2: Chef Marco's character reference (use for face, mustache, chef outfit)
- Image 3: Art style reference (match this exact rendering style)

Generate: Isaiah and Chef Marco in [SCENE]..."
```

### 5. Changing Outfits While Preserving Identity

```
"Show the same character from the reference image wearing [NEW OUTFIT].
Keep ALL facial features identical:
- Same face shape and structure
- Same eye color and shape
- Same hair style and color
- Same skin tone

Only change: clothing to [DETAILED OUTFIT DESCRIPTION]."
```

### 6. Expression Variations

```
"Same character from reference image with [EMOTION] expression.
Maintain: face structure, eye color, hair, all distinguishing features.
Change only: facial expression to show [SPECIFIC EMOTION DETAILS]."
```

**Emotion Keywords:**
- Happy: "warm smile, eyes crinkled with joy, rosy cheeks"
- Scared: "wide eyes, mouth slightly open, eyebrows raised"
- Curious: "head tilted, eyes focused, slight smile"
- Brave: "determined eyes, confident stance, slight frown of concentration"
- Surprised: "eyebrows high, mouth open in an 'O', eyes wide"

### 7. Environment Variations

Describe environments in detail without mentioning character appearance:

```
"SCENE: [LOCATION NAME]
ENVIRONMENT: [Detailed description of setting, objects, architecture]
LIGHTING: [Specific lighting conditions]
ATMOSPHERE: [Mood, weather, time of day]
ACTION: [What the character is doing - reference their appearance from the image]"
```

---

## Advanced Techniques

### Chained Generation (Current Implementation)

Use the first successful generation as a style reference for all subsequent images:

```javascript
// Generate page 1 first (becomes style anchor)
const styleRef = await generatePage(1, null);

// Use page 1 as style reference for all subsequent pages
for (let page = 2; page <= 10; page++) {
  await generatePage(page, styleRef);
}
```

### Character Sheet Library

Generate multiple reference views for complex projects:

1. **Front portrait** (face detail)
2. **3/4 view** (depth and dimension)
3. **Profile** (nose, chin structure)
4. **Full body** (proportions, outfit)
5. **Expression grid** (happy, sad, angry, surprised, neutral)
6. **Action poses** (running, sitting, pointing)

### Iterative Refinement

Use conversational editing to refine consistency:

```
Turn 1: Generate base character
Turn 2: "Adjust the eye shape to be more [description]"
Turn 3: "Keep that, but make the hair [adjustment]"
Turn 4: "Perfect. Now show this character in [new scene]"
```

---

## Common Pitfalls to Avoid

### 1. Vague Character Descriptions
❌ "A young boy"
✅ "A 6-year-old Asian American boy with short black hair, brown eyes, round face, rosy cheeks"

### 2. Missing Identity Lock
❌ "Generate Isaiah in the kitchen"
✅ "Using the reference image for Isaiah's exact appearance, generate Isaiah in the kitchen"

### 3. Style Drift
❌ Not including a style reference
✅ Include both character reference AND a previous successful image as style reference

### 4. Inconsistent Prompt Details
❌ Mentioning "blue eyes" in one prompt and "brown eyes" in another
✅ Copy-paste the exact same character description block in every prompt

### 5. Overloading References
❌ Including 14 loosely related images
✅ Include only directly relevant references (character + style)

---

## Recommended Prompt Templates

### Template 1: Scene Generation with Character Reference
```
CRITICAL: Use the reference image to maintain EXACT character appearance.

CHARACTER: [Name] - [Ethnicity] [age]-year-old [gender] with [hair], [eyes], [face shape], wearing [outfit]. [Distinctive features].

SCENE: [Location/Setting name]
ENVIRONMENT: [Detailed environment description - colors, objects, architecture, textures]
LIGHTING: [Lighting description - warm/cool, source, mood]
ACTION: [What the character is doing]

STYLE: [Art style description - be specific and consistent]
- [Specific style element 1]
- [Specific style element 2]
- [Color palette]

CONSTRAINTS:
- Maintain character identity from reference
- Match art style exactly
- NO text or words in image
- [Aspect ratio]
```

### Template 2: Expression Change
```
Same character as reference image showing [EMOTION].

KEEP IDENTICAL:
- Face structure and proportions
- Eye color and shape
- Hair style and color
- Skin tone
- Outfit

CHANGE ONLY:
- Expression: [detailed expression description]
- [Optional: pose adjustment]
```

### Template 3: Outfit Change
```
Same character as reference image wearing NEW OUTFIT.

PRESERVE FROM REFERENCE:
- Exact facial features
- Hair style and color
- Body proportions
- Art style and rendering

NEW OUTFIT:
[Detailed outfit description including colors, textures, accessories]

SETTING: [Environment if different]
```

---

## Current Implementation Status

### What's Working
- Character reference sheets generated for Isaiah, Chef Marco, Mouse
- Page 1 used as style reference for subsequent pages
- Explicit character descriptions in every prompt
- Identity lock phrases ("DO NOT change ethnicity")

### Potential Improvements
1. **Generate expression variants** for each character
2. **Create outfit variants** (Isaiah in different pajamas for variety)
3. **Add pose references** to the character library
4. **Test multi-turn refinement** for problematic generations
5. **Experiment with reference image ordering** (character first vs style first)

---

## Sources

- [Google DeepMind - Gemini 3 Pro Image](https://deepmind.google/models/gemini-image/pro/)
- [Nano Banana Pro Prompting Tips](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
- [Google AI - Image Generation Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Atlabs - Ultimate Nano Banana Pro Prompting Guide](https://www.atlabs.ai/blog/the-ultimate-nano-banana-pro-prompting-guide-mastering-gemini-3-pro-image)
- [Imagine with Rashid - Consistent Characters Guide](https://imaginewithrashid.com/how-to-create-consistent-characters-using-gemini-nano-banana-pro/)
- [CyberLink - Gemini 3 Nano Banana Pro Tutorial](https://www.cyberlink.com/blog/trending-topics/4414/gemini-3-nano-banana-pro)
- [ChatSmith - Using Gemini for Consistent Characters](https://chatsmith.io/blogs/ai-guide/using-gemini-nano-banana-consistent-characters-ai-images-00037)
