# Math Integration Checklist

## Visual Components
- [ ] Number Line - renders correctly with highlights and jump arrows
- [ ] Counters - displays grouped items with staggered animation
- [ ] Ten Frame - shows 5x2 grid with filled cells
- [ ] 2D Shapes - displays SVG shapes with labels and highlighting
- [ ] 3D Shapes - shows rotating cube, sphere, cylinder, cone

## Page Rendering
- [ ] Read pages show mathConcept banner
- [ ] Read pages show mathTip bubble
- [ ] Read pages render visual objects
- [ ] Question pages show mathContext
- [ ] Question pages show numberSentence box
- [ ] Question pages show mathHint after wrong answer

## CPA System
- [ ] CPASystem object is globally accessible
- [ ] Progress bar renders with correct stage highlighted
- [ ] Stage detection works for all visual types

## Subject Switching
- [ ] Subject selector renders correctly
- [ ] Switching to Math loads math content pack
- [ ] Math lines (OA, NBT, MD, G) display correctly
- [ ] Switching back to ELA loads ELA content pack

## Progress Tracking
- [ ] Progress is tracked per subject
- [ ] Stickers accumulate correctly
- [ ] Station completion is recorded

## Testing
- [ ] All stations load without errors
- [ ] All page types render correctly
- [ ] Animations play smoothly
- [ ] No console errors during lesson flow

## Integration Points Verified

### Function Exposure (✓ Complete)
All math visual functions are properly exposed to the window object:
- `window.renderMathVisual`
- `window.renderNumberLine`
- `window.renderCounters`
- `window.renderTenFrame`
- `window.render2DShapes`
- `window.render3DShape`
- `window.CPASystem`

### Defensive Coding (✓ Complete)
All rendering functions now have:
- Null/undefined checks at the beginning
- Default parameter values
- Graceful fallback for unknown visual types
- Warning messages logged for debugging

### Page Flow Integration (✓ Verified)
- `showReadingPage` calls `renderMathVisual` when page.visual exists
- `showReadingPage` displays `mathConcept` banner when present
- `showReadingPage` displays `mathTip` bubble when present
- `showQuestionPage` displays `mathContext` when present
- `showQuestionPage` displays `numberSentence` when present
- `showQuestionPage` shows `mathHint` after wrong answer

### CPA Progress System (✓ Verified)
- CPASystem maps visual types to stages (concrete/pictorial/abstract)
- Progress bar renders with icons and stage highlighting
- Both reading and question pages render CPA progress bars

## Testing Recommendations

1. **Visual Rendering Test**
   - Load a math station
   - Verify each page type renders correctly
   - Check that animations play smoothly
   - Confirm no console errors

2. **Subject Switching Test**
   - Start with ELA content
   - Switch to Math subject
   - Verify math stations load
   - Switch back to ELA
   - Verify ELA stations still work

3. **Progress Tracking Test**
   - Complete a math station
   - Verify sticker is awarded
   - Check that station shows as complete
   - Confirm progress persists after refresh

4. **CPA Progression Test**
   - Complete stations with different visual types
   - Verify correct CPA stage is highlighted
   - Check that stage colors match visual types

5. **Error Handling Test**
   - Test with missing visual data
   - Test with unknown visual type
   - Verify graceful degradation
   - Check that helpful warnings are logged

## Known Implementation Details

### Visual Types Supported
- `numberLine` - Number line with highlights and jump arrows
- `counters` - Grouped objects with various styles (circles, stars, apples, fish, hearts, trains, bubbles)
- `tenFrame` - 5x2 grid for counting to 10 or 20
- `shapes` - 2D geometric shapes (circle, square, triangle, rectangle, etc.)
- `3dShape` - 3D shapes (cube, sphere, cylinder, cone)

### CPA Stage Mapping
- **Concrete**: counters, objects, manipulatives, blocks
- **Pictorial**: numberLine, tenFrame, shapes, diagram, picture
- **Abstract**: equation, numberSentence, symbol

### Math-Specific Fields
**Read Pages:**
- `mathConcept` - Main learning objective displayed in banner
- `mathTip` - Helpful tip displayed in bubble
- `visual` - Visual object with type and data

**Question Pages:**
- `mathContext` - Context sentence for the problem
- `numberSentence` - Number sentence with blanks (e.g., "3 + 2 = ___")
- `mathHint` - Hint shown after incorrect answer

## Status Summary

✅ **Completed:**
- Function exposure to window object
- Defensive coding and null checks
- Default case for unknown visual types
- Integration with showReadingPage
- Integration with showQuestionPage
- CPA progress system
- Math-specific field rendering

⏳ **Pending Manual Testing:**
- End-to-end lesson flow
- Subject switching
- Progress persistence
- Visual rendering on different devices
- Animation performance
