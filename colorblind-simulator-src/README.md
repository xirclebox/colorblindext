# Colorblindness & Low Vision Simulator

A Chrome and Firefox extension that simulates various types of colorblindness and low vision conditions to help developers and designers test their websites for accessibility.

## Features

### Colorblindness Simulations

- **Protanopia** - Red-blind
- **Protanomaly** - Red-weak
- **Deuteranopia** - Green-blind
- **Deuteranomaly** - Green-weak
- **Tritanopia** - Blue-blind
- **Tritanomaly** - Blue-weak
- **Achromatopsia** - Complete color blindness
- **Achromatomaly** - Partial color blindness

### Low Vision Simulations

- **Mild Blur** - Slight vision impairment
- **Moderate Blur** - Moderate vision impairment
- **Severe Blur** - Severe vision impairment
- **Low Contrast** - Reduced contrast sensitivity
- **Cataracts** - Cloudy/yellowed vision with blur

### Additional Features

- **Persistent State** - Your selected filter is remembered across page reloads
- **Instant Feedback** - UI updates immediately when selecting filters

## Installation

### From Source Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Select the `colorblind-simulator` folder
5. The extension is now installed!

### From Source Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on…"
3. Navigate to the `colorblind-simulator` folder and select the `manifest.json` file
4. The extension is now installed!

### Usage

1. Click the extension icon in your Chrome toolbar
2. Select any vision condition from the popup menu
3. The filter will be applied immediately to the current tab
4. Click "Normal Vision" to remove the filter
5. Test different conditions to ensure your website is accessible
6. The filter persists across page reloads until you change it

## Why This Matters

- **8% of men** and **0.5% of women** have some form of color vision deficiency
- Many more people have low vision conditions
- Testing with these simulations helps ensure your website is accessible to everyone
- Improves compliance with WCAG (Web Content Accessibility Guidelines)

## Technical Details

The extension uses SVG color matrix filters to accurately simulate different types of color vision deficiencies. The color matrices are based on research into how different types of colorblindness affect color perception.

### Recent Improvements

- You can now create combinations by selecting one color vision filter and one low vision filter
- Added badges to show which filters are active
- Added a "Reset" button that clears the active filters
- Header is now sticky so that the badges are always visible

## Privacy

This extension:

- Works entirely locally in your browser
- Does not collect any data
- Does not send any information to external servers
- Only affects the visual display of web pages
- Only stores your filter preference locally

## Contributing

Suggestions and improvements are welcome! This tool helps make the web more accessible for everyone.

## License

MIT License - Feel free to use and modify as needed.

## Resources

- [colorblind.fyi](https://www.colorblind.fyi)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Blindness Information](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness)
