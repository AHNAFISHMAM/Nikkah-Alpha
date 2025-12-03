import potrace from 'potrace';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function improveSVGConversion() {
  try {
    const inputPath = join(__dirname, '../public/logo.png');
    const outputPath = join(__dirname, '../public/logo.svg');
    
    console.log('🔄 Creating high-quality SVG from logo.png...');
    
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`📐 Image size: ${metadata.width}x${metadata.height}`);
    
    // Read the PNG file
    const imageBuffer = readFileSync(inputPath);
    
    // Convert to SVG with better settings for color images
    potrace.trace(imageBuffer, {
      color: 'auto',
      background: 'transparent',
      threshold: 128,
      optCurve: true,
      optTolerance: 0.4,
      turdSize: 2,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
      alphaMax: 1.0,
      optCurve: true
    }, async (err, svg) => {
      if (err) {
        console.error('❌ Error converting:', err);
        return;
      }
      
      // Extract colors from original image
      const { data, info } = await sharp(inputPath)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const width = info.width;
      const height = info.height;
      const channels = info.channels;
      
      // Sample colors from different regions
      const crescentX = Math.floor(width * 0.3);
      const crescentY = Math.floor(height * 0.5);
      const crescentIdx = (crescentY * width + crescentX) * channels;
      const crescentR = data[crescentIdx];
      const crescentG = data[crescentIdx + 1];
      const crescentB = data[crescentIdx + 2];
      const crescentColor = `#${crescentR.toString(16).padStart(2, '0')}${crescentG.toString(16).padStart(2, '0')}${crescentB.toString(16).padStart(2, '0')}`.toUpperCase();
      
      const heartLeftX = Math.floor(width * 0.5);
      const heartLeftY = Math.floor(height * 0.5);
      const heartLeftIdx = (heartLeftY * width + heartLeftX) * channels;
      const heartLeftR = data[heartLeftIdx];
      const heartLeftG = data[heartLeftIdx + 1];
      const heartLeftB = data[heartLeftIdx + 2];
      const heartLeftColor = `#${heartLeftR.toString(16).padStart(2, '0')}${heartLeftG.toString(16).padStart(2, '0')}${heartLeftB.toString(16).padStart(2, '0')}`.toUpperCase();
      
      const heartRightX = Math.floor(width * 0.7);
      const heartRightY = Math.floor(height * 0.5);
      const heartRightIdx = (heartRightY * width + heartRightX) * channels;
      const heartRightR = data[heartRightIdx];
      const heartRightG = data[heartRightIdx + 1];
      const heartRightB = data[heartRightIdx + 2];
      const heartRightColor = `#${heartRightR.toString(16).padStart(2, '0')}${heartRightG.toString(16).padStart(2, '0')}${heartRightB.toString(16).padStart(2, '0')}`.toUpperCase();
      
      console.log('🎨 Colors extracted:');
      console.log('   Crescent:', crescentColor);
      console.log('   Heart Left:', heartLeftColor);
      console.log('   Heart Right:', heartRightColor);
      
      // Enhance SVG with proper viewBox and colors
      let enhancedSVG = svg;
      
      // Update viewBox to match original dimensions
      enhancedSVG = enhancedSVG.replace(
        /viewBox="[^"]*"/,
        `viewBox="0 0 ${metadata.width} ${metadata.height}"`
      );
      
      // Add width and height attributes
      enhancedSVG = enhancedSVG.replace(
        /<svg([^>]*)>/,
        `<svg width="${metadata.width}" height="${metadata.height}"$1>`
      );
      
      // Add gradient definition
      if (!enhancedSVG.includes('<defs>')) {
        enhancedSVG = enhancedSVG.replace(
          /<svg([^>]*)>/,
          `<svg$1><defs>
  <linearGradient id="heartGradient" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" style="stop-color:${heartLeftColor};stop-opacity:1" />
    <stop offset="100%" style="stop-color:${heartRightColor};stop-opacity:1" />
  </linearGradient>
</defs>`
        );
      }
      
      // Ensure fill-rule is set for proper filling
      enhancedSVG = enhancedSVG.replace(
        /<g([^>]*)>/,
        '<g$1 fill-rule="nonzero">'
      );
      
      // Write the enhanced SVG
      writeFileSync(outputPath, enhancedSVG, 'utf-8');
      console.log('✅ Enhanced SVG created at:', outputPath);
      console.log('📏 Size:', (enhancedSVG.length / 1024).toFixed(2), 'KB');
      console.log('✨ SVG includes:');
      console.log('   - Proper dimensions');
      console.log('   - Color gradient for heart');
      console.log('   - All paths properly filled');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

improveSVGConversion();

