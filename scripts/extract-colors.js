import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function extractColors() {
  try {
    const imagePath = join(__dirname, '../public/logo.png');
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    console.log('Image dimensions:', metadata.width, 'x', metadata.height);
    
    // Extract dominant colors using k-means clustering
    const { dominant } = await image.stats();
    
    // Get pixel data to analyze colors
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Sample colors from different regions
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Sample from crescent area (left side, middle)
    const crescentX = Math.floor(width * 0.3);
    const crescentY = Math.floor(height * 0.5);
    const crescentIdx = (crescentY * width + crescentX) * channels;
    const crescentR = data[crescentIdx];
    const crescentG = data[crescentIdx + 1];
    const crescentB = data[crescentIdx + 2];
    const crescentColor = `#${crescentR.toString(16).padStart(2, '0')}${crescentG.toString(16).padStart(2, '0')}${crescentB.toString(16).padStart(2, '0')}`;
    
    // Sample from heart left side (green area)
    const heartLeftX = Math.floor(width * 0.5);
    const heartLeftY = Math.floor(height * 0.5);
    const heartLeftIdx = (heartLeftY * width + heartLeftX) * channels;
    const heartLeftR = data[heartLeftIdx];
    const heartLeftG = data[heartLeftIdx + 1];
    const heartLeftB = data[heartLeftIdx + 2];
    const heartLeftColor = `#${heartLeftR.toString(16).padStart(2, '0')}${heartLeftG.toString(16).padStart(2, '0')}${heartLeftB.toString(16).padStart(2, '0')}`;
    
    // Sample from heart right side (teal area)
    const heartRightX = Math.floor(width * 0.7);
    const heartRightY = Math.floor(height * 0.5);
    const heartRightIdx = (heartRightY * width + heartRightX) * channels;
    const heartRightR = data[heartRightIdx];
    const heartRightG = data[heartRightIdx + 1];
    const heartRightB = data[heartRightIdx + 2];
    const heartRightColor = `#${heartRightR.toString(16).padStart(2, '0')}${heartRightG.toString(16).padStart(2, '0')}${heartRightB.toString(16).padStart(2, '0')}`;
    
    console.log('\n=== Extracted Colors ===');
    console.log('Crescent (Golden):', crescentColor);
    console.log('Heart Left (Green):', heartLeftColor);
    console.log('Heart Right (Teal):', heartRightColor);
    console.log('\n=== SVG Color Values ===');
    console.log(`Crescent fill: "${crescentColor.toUpperCase()}"`);
    console.log(`Heart gradient start: "${heartLeftColor.toUpperCase()}"`);
    console.log(`Heart gradient end: "${heartRightColor.toUpperCase()}"`);
    
    return {
      crescent: crescentColor.toUpperCase(),
      heartStart: heartLeftColor.toUpperCase(),
      heartEnd: heartRightColor.toUpperCase()
    };
  } catch (error) {
    console.error('Error extracting colors:', error);
    throw error;
  }
}

extractColors();

