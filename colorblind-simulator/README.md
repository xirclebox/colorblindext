# Colorblindness & Low Vision Simulator

A Chrome extension that simulates various types of colorblindness and low vision conditions to help developers and designers test their websites for accessibility.

## Features

### Colorblindness Simulations
- **Protanopia** - Red-blind (affects ~1% of males)
- **Protanomaly** - Red-weak (affects ~1% of males)
- **Deuteranopia** - Green-blind (affects ~1% of males)
- **Deuteranomaly** - Green-weak (affects ~5% of males, most common)
- **Tritanopia** - Blue-blind (rare)
- **Tritanomaly** - Blue-weak (rare)
- **Achromatopsia** - Complete color blindness (monochromacy)
- **Achromatomaly** - Partial color blindness

### Low Vision Simulations
- **Mild Blur** - Slight vision impairment
- **Moderate Blur** - Moderate vision impairment
- **Severe Blur** - Severe vision impairment
- **Low Contrast** - Reduced contrast sensitivity
- **Cataracts** - Cloudy/yellowed vision with blur

### Additional Features
- **Persistent State** - Your selected filter is remembered across page reloads
- **Error-Free** - Robust message handling prevents console errors
- **Instant Feedback** - UI updates immediately when selecting filters

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Select the `colorblind-simulator` folder
6. The extension is now installed!

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
- Added timeout handling for message passing to prevent runtime errors
- Implemented state persistence using Chrome's storage API
- Enhanced error handling for better reliability
- Improved initialization sequence for smoother performance

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

- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Blindness Information](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness)
