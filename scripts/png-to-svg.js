import potrace from 'potrace';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertPNGtoSVG() {
  try {
    const inputPath = join(__dirname, '../public/logo.png');
    const outputPath = join(__dirname, '../public/logo.svg');
    
    console.log('🔄 Converting logo.png to SVG...');
    
    // Read the PNG file
    const imageBuffer = readFileSync(inputPath);
    
    // Convert to SVG using potrace
    potrace.trace(imageBuffer, {
      color: 'auto',
      background: 'transparent',
      threshold: 128,
      optCurve: true,
      optTolerance: 0.4,
      turdSize: 2,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY
    }, (err, svg) => {
      if (err) {
        console.error('❌ Error converting:', err);
        return;
      }
      
      // Extract colors from original image to apply to SVG
      sharp(inputPath)
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          const width = info.width;
          const height = info.height;
          const channels = info.channels;
          
          // Sample colors
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
          
          console.log('🎨 Extracted colors:');
          console.log('   Crescent:', crescentColor);
          console.log('   Heart Left:', heartLeftColor);
          console.log('   Heart Right:', heartRightColor);
          
          // Enhance SVG with colors and gradients
          let enhancedSVG = svg;
          
          // Add gradient definition if not present
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
          
          // Apply colors to paths (this is a simplified approach)
          // The actual path identification would need more sophisticated logic
          enhancedSVG = enhancedSVG.replace(/fill="#[^"]*"/g, (match) => {
            // This is a placeholder - actual implementation would need to identify which path is which
            return match;
          });
          
          // Write the SVG file
          writeFileSync(outputPath, enhancedSVG, 'utf-8');
          console.log('✅ SVG created successfully at:', outputPath);
          console.log('📏 Size:', (enhancedSVG.length / 1024).toFixed(2), 'KB');
        })
        .catch(err => {
          console.error('❌ Error processing colors:', err);
          // Still write the SVG even if color extraction fails
          writeFileSync(outputPath, svg, 'utf-8');
          console.log('✅ SVG created (without color enhancement)');
        });
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

convertPNGtoSVG();

