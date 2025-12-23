# Math Visual Components Reference

This document provides a reference for all available math visual rendering functions.

## Available Visual Types

### 1. Number Line
**Function**: `renderNumberLine(data, container)`

**Data Structure**:
```javascript
{
  start: 0,        // Starting number
  end: 10,         // Ending number
  highlight: [3, 4, 5],  // Numbers to highlight
  jumps: []        // Optional jump annotations
}
```

**Usage in Content Pack**:
```json
{
  "visual": {
    "type": "numberLine",
    "data": {
      "start": 0,
      "end": 15,
      "highlight": [5, 6, 7, 8]
    }
  }
}
```

**Visual Features**:
- Horizontal number line with evenly spaced ticks
- Highlighted numbers shown with yellow background
- Animated jump arrows between consecutive highlights
- Responsive width (max 600px)

---

### 2. Counters
**Function**: `renderCounters(data, container)`

**Data Structure**:
```javascript
{
  count: 8,        // Total number of items
  groupOf: 5,      // Items per group
  style: 'apples'  // Visual style
}
```

**Available Styles**:
- `circles` - 🔴 Red circles
- `stars` - ⭐ Stars
- `apples` - 🍎 Apples
- `fish` - 🐟 Fish
- `hearts` - ❤️ Hearts
- `trains` - 🚃 Train cars
- `bubbles` - 🫧 Bubbles

**Usage in Content Pack**:
```json
{
  "visual": {
    "type": "counters",
    "data": {
      "count": 8,
      "groupOf": 5,
      "style": "apples"
    }
  }
}
```

**Visual Features**:
- Items grouped by specified groupOf value
- Animated pop-in effect
- Staggered animation delays for visual interest

---

### 3. Ten Frame
**Function**: `renderTenFrame(data, container)`

**Data Structure**:
```javascript
{
  count: 7,        // Number to represent (0-20)
  style: 'dots',   // Visual style
  frameCount: 1    // Number of frames (1 or 2)
}
```

**Available Styles**:
- `dots` - Colored dots (default)
- `stars` - ⭐ Star emojis
- `fish` - 🐟 Fish emojis

**Usage in Content Pack**:
```json
{
  "visual": {
    "type": "tenFrame",
    "data": {
      "count": 7,
      "style": "dots"
    }
  }
}
```

**Visual Features**:
- Classic 2x5 grid structure
- Fills left-to-right, top-to-bottom
- Supports double ten frames for numbers 11-20
- Animated fill with rotation effect

---

### 4. 2D Shapes
**Function**: `render2DShapes(data, container)`

**Data Structure**:
```javascript
{
  shapes: ['circle', 'square', 'triangle', 'rectangle'],
  highlight: 'triangle'  // Optional shape to highlight
}
```

**Available Shapes**:
- `circle` - Red circle
- `square` - Blue square
- `rectangle` - Green rectangle
- `triangle` - Orange triangle
- `hexagon` - Purple hexagon
- `pentagon` - Teal pentagon

**Usage in Content Pack**:
```json
{
  "visual": {
    "type": "shapes",
    "data": {
      "shapes": ["circle", "square", "triangle", "rectangle"],
      "highlight": "triangle"
    }
  }
}
```

**Visual Features**:
- Displays multiple shapes in a row
- Each shape has distinct color
- Highlighted shape has yellow border and scales up
- Shape names displayed below each shape
- Animated appearance with rotation

---

### 5. 3D Shapes
**Function**: `render3DShape(data, container)`

**Data Structure**:
```javascript
{
  shape: 'cube',    // Shape to display
  showFaces: true,  // Label cube faces
  label: 'Cube'     // Optional label
}
```

**Available Shapes**:
- `cube` - Blue cube with labeled faces
- `sphere` - Red sphere with gradient
- `cylinder` - Green cylinder
- `cone` - Orange cone

**Usage in Content Pack**:
```json
{
  "visual": {
    "type": "3dShape",
    "data": {
      "shape": "cube",
      "showFaces": true,
      "label": "Cube"
    }
  }
}
```

**Visual Features**:
- 3D perspective rendering using CSS transforms
- Rotating animation (8 second loop)
- Cube faces can be labeled (Front, Back, Left, Right, Top, Bottom)
- Realistic shading and depth

---

## Master Rendering Function

### renderMathVisual(visual, container)

**Purpose**: Universal dispatcher for all math visuals

**Parameters**:
- `visual`: Object with `type` and `data` properties
- `container`: DOM element to append visual to

**Usage**:
```javascript
renderMathVisual({
  type: 'numberLine',
  data: { start: 0, end: 10, highlight: [5, 6] }
}, containerElement);
```

**Supported Types**:
- `numberLine`
- `counters`
- `tenFrame`
- `shapes`
- `3dShape`

---

## CPA System Integration

All visuals are integrated with the CPA (Concrete-Pictorial-Abstract) progression system:

**CPA Stages**:
1. **Concrete**: Physical objects (counters, ten frames)
2. **Pictorial**: Visual representations (shapes, number lines)
3. **Abstract**: Symbols and numbers

**Progression Indicator**:
The system automatically displays a progress bar showing which CPA stage the current visual represents.

---

## Global Exposure

All functions are exposed to the `window` object for testing and external access:

```javascript
window.renderMathVisual
window.renderNumberLine
window.renderCounters
window.renderTenFrame
window.render2DShapes
window.render3DShape
window.CPASystem
```

---

## CSS Classes Reference

### Container Classes
- `.math-visual-container` - Main wrapper for all visuals
- `.number-line` - Number line container
- `.counters-container` - Counters container
- `.ten-frame` - Ten frame grid
- `.shapes-container` - 2D shapes container
- `.shape-3d-container` - 3D shape container

### Component Classes
- `.number-tick` - Number line tick marks
- `.number-label` - Number line labels
- `.jump-arrow` - Jump arrows on number line
- `.counter-item` - Individual counter
- `.counter-group` - Group of counters
- `.ten-frame-cell` - Ten frame cell
- `.ten-frame-dot` - Ten frame dot
- `.shape-item` - 2D shape wrapper
- `.shape-display` - 2D shape visual
- `.shape-3d-object` - 3D shape object

### Animation Classes
- Automatically applied with staggered delays
- `shapeAppear` - 2D shape entrance
- `counterPop` - Counter pop-in
- `cellFill` - Ten frame fill
- `rotate3D` - 3D shape rotation

---

## Examples

### Example 1: Number Line for Addition
```json
{
  "visual": {
    "type": "numberLine",
    "data": {
      "start": 0,
      "end": 15,
      "highlight": [5, 6, 7, 8]
    }
  }
}
```
Shows a number line from 0-15 with 5, 6, 7, 8 highlighted (representing 5+3=8).

### Example 2: Counters for Counting
```json
{
  "visual": {
    "type": "counters",
    "data": {
      "count": 12,
      "groupOf": 5,
      "style": "fish"
    }
  }
}
```
Shows 12 fish grouped in sets of 5 (two groups of 5, one group of 2).

### Example 3: Ten Frame for Subitizing
```json
{
  "visual": {
    "type": "tenFrame",
    "data": {
      "count": 7,
      "style": "dots"
    }
  }
}
```
Shows a ten frame with 7 dots filled.

### Example 4: 2D Shapes for Geometry
```json
{
  "visual": {
    "type": "shapes",
    "data": {
      "shapes": ["circle", "square", "triangle"],
      "highlight": "square"
    }
  }
}
```
Shows three shapes with the square highlighted.

### Example 5: 3D Cube
```json
{
  "visual": {
    "type": "3dShape",
    "data": {
      "shape": "cube",
      "showFaces": true,
      "label": "Cube - 6 faces"
    }
  }
}
```
Shows a rotating 3D cube with labeled faces.

---

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

Quick test in browser console:
```javascript
// Test number line
const container = document.createElement('div');
document.body.appendChild(container);
window.renderNumberLine({ start: 0, end: 10, highlight: [5] }, container);
```

---

## Visual Type Usage Statistics

Based on the content pack analysis, here are the visual types and their usage:

| Visual Type    | Pages | Implementation Status |
|----------------|-------|-----------------------|
| blocks         | 37    | ⚠️ Not implemented    |
| shapes         | 21    | ✅ Implemented         |
| counters       | 12    | ✅ Implemented         |
| pictureGraph   | 12    | ⚠️ Not implemented    |
| numberLine     | 11    | ✅ Implemented         |
| comparison     | 10    | ⚠️ Not implemented    |
| clock          | 9     | ⚠️ Not implemented    |
| measurement    | 6     | ⚠️ Not implemented    |
| balance        | 3     | ⚠️ Not implemented    |
| data           | 2     | ⚠️ Not implemented    |
| tallyMarks     | 2     | ⚠️ Not implemented    |
| tenFrame       | 1     | ✅ Implemented         |

**Total**: 126 pages with visuals

**Implementation Coverage**: 4/12 visual types (33%)

**Note**: The four implemented types (shapes, counters, numberLine, tenFrame) cover 45 pages (36% of visual content). The remaining types would need to be implemented to achieve full visual coverage.

### Priority for Future Implementation

Based on usage frequency:
1. **blocks** (37 pages) - Highest priority
2. **pictureGraph** (12 pages) - High priority
3. **comparison** (10 pages) - High priority
4. **clock** (9 pages) - Medium priority
5. **measurement** (6 pages) - Medium priority
6. **balance** (3 pages) - Low priority
7. **data** (2 pages) - Low priority
8. **tallyMarks** (2 pages) - Low priority

