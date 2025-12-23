# Math Integration Testing Guide

This document describes the testing and validation tools for the MRT Food Adventure math lesson integration.

## Overview

The math integration includes:
- Number line visuals
- Counters and ten-frames
- 2D/3D geometry shapes
- Math question enhancements (numberSentence, mathHint, mathContext)
- Math read page enhancements (mathTip, mathConcept)
- CPA progression indicators
- Subject switching (ELA/Math)

## Testing Tools

### 1. Validation Script

**Location**: `/scripts/validate-math-integration.mjs`

**Purpose**: Automated validation of all math integration components

**Usage**:
```bash
node scripts/validate-math-integration.mjs
```

**What it checks**:
- Content pack exists and has correct structure
- All 30 stations are present
- Math-specific fields are populated (mathTip, mathConcept, numberSentence, etc.)
- All rendering functions exist in index.html
- All CSS classes are defined
- Station selection configuration exists
- Subject switching is implemented

**Expected output**:
```
🧪 Math Integration Validation
==================================================
✅ Content pack exists
✅ Schema version is 1
... (26 total checks)
==================================================
📊 Results: 26 passed, 0 failed
🎉 All validations passed! Math integration is complete.
```

### 2. Interactive Test Page

**Location**: `/test-math-integration.html`

**Purpose**: Browser-based interactive testing of visual components

**Usage**:
1. Start a local web server (required for loading JSON content packs)
2. Navigate to `http://localhost:8080/test-math-integration.html`
3. Run test suites and preview visuals

**Features**:
- **Visual Components Test**: Checks if all rendering functions are available
- **Content Pack Test**: Loads and validates the math content pack
- **Lesson Flow Test**: Verifies subject switching and state management
- **Live Preview Buttons**: Renders each visual type on demand
  - Number Line
  - Counters
  - Ten Frame
  - 2D Shapes
  - 3D Cube

## Running Tests

### Automated Testing
```bash
# Run validation script
node scripts/validate-math-integration.mjs

# Exit code 0 = all tests passed
# Exit code 1 = some tests failed
```

### Manual Browser Testing
```bash
# Start local server (choose one):
python3 -m http.server 8080
# or
npx http-server -p 8080

# Open browser to:
# http://localhost:8080/test-math-integration.html
```

## Test Results Interpretation

### Validation Script Results

Each check displays:
- ✅ Green checkmark = passed
- ❌ Red X = failed
- Additional details shown after colon

Common failures:
- **Content pack missing**: Ensure `/content/cpa-grade1-math/content-pack.v1.json` exists
- **Function not found**: Check that function is defined and exposed to window object
- **CSS missing**: Verify CSS classes are defined in `<style>` section

### Browser Test Results

Each test shows color-coded results:
- 🟢 Green background = passed
- 🔴 Red background = failed
- 🟡 Yellow background = pending/not run

## Extending Tests

### Adding New Validation Checks

Edit `/scripts/validate-math-integration.mjs`:

```javascript
check('Your test name',
  condition_to_check,
  'Details message');
```

### Adding New Browser Tests

Edit `/test-math-integration.html`:

```javascript
function testNewFeature() {
  const container = 'yourTestsContainer';

  logResult(container, 'Test Name',
    yourCondition,
    'Success or failure message');
}
```

## Continuous Integration

The validation script is designed to be CI-friendly:
- Returns exit code 0 for success, 1 for failure
- Output is parseable and clear
- No external dependencies beyond Node.js

Example GitHub Actions usage:
```yaml
- name: Validate Math Integration
  run: node scripts/validate-math-integration.mjs
```

## Troubleshooting

### "Content pack fetch failed"
- Ensure you're running a local web server
- Check that content pack path is correct
- Verify JSON is valid

### "Function not found"
- Check that index.html defines the function
- Verify function is exposed to window object
- Look for JavaScript errors in console

### "Visual not rendering"
- Check browser console for errors
- Verify CSS classes are defined
- Ensure data structure matches function expectations

## File Locations

- **Test HTML**: `/test-math-integration.html`
- **Validation Script**: `/scripts/validate-math-integration.mjs`
- **Content Pack**: `/content/cpa-grade1-math/content-pack.v1.json`
- **Main App**: `/index.html`
- **Station Selection**: `/station-selection.js`

## Support

For issues or questions:
1. Check browser console for errors
2. Run validation script for automated diagnostics
3. Review this documentation
4. Examine the content pack structure
