import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createFilledLogoSVG() {
  try {
    const inputPath = join(__dirname, '../public/logo.png');
    const outputPath = join(__dirname, '../public/logo.svg');
    
    console.log('🔄 Creating filled SVG from logo.png...');
    
    // Extract colors from the image
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
    
    // Create SVG with proper paths from the original traced SVG structure
    // These paths are from the original r6yq9C01.svg which was traced from the logo
    const svgContent = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="${width}" height="${height}" viewBox="0 0 300.000000 300.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created from logo.png - NikahPrep Logo
</metadata>
<defs>
  <linearGradient id="heartGradient" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" style="stop-color:${heartLeftColor};stop-opacity:1" />
    <stop offset="100%" style="stop-color:${heartRightColor};stop-opacity:1" />
  </linearGradient>
</defs>
<g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"
stroke="none" fill-rule="nonzero">
<path d="M1300 2321 c-282 -77 -499 -277 -590 -545 -137 -402 33 -826 410
-1020 124 -64 211 -87 361 -93 244 -11 438 58 611 216 117 108 261 351 208
351 -4 0 -27 -25 -50 -55 -142 -184 -410 -279 -650 -231 -434 88 -681 520
-535 937 61 174 180 307 353 394 92 46 95 65 10 64 -35 0 -92 -9 -128 -18z
m34 -63 c-211 -142 -328 -347 -338 -594 -20 -463 407 -835 860 -749 108 21
249 85 317 145 57 51 60 38 8 -38 -89 -131 -231 -236 -397 -294 -80 -28 -104
-32 -234 -36 -128 -4 -156 -2 -225 17 -111 30 -193 61 -206 77 -6 8 -16 14
-21 14 -18 0 -131 87 -179 137 -229 238 -290 601 -153 900 13 30 24 56 24 59
0 3 15 27 33 52 17 26 37 53 42 61 34 49 153 152 219 190 105 60 233 105 309
110 11 1 -16 -23 -59 -51z" fill="${crescentColor}" fill-rule="nonzero" stroke="none"/>
<path d="M1410 1921 c-87 -27 -147 -80 -183 -160 -29 -65 -21 -188 17 -262 36
-73 137 -190 233 -270 126 -107 252 -199 272 -199 24 0 210 142 312 238 89 83
154 163 189 232 35 68 40 198 10 268 -29 66 -103 137 -161 152 -60 16 -165 8
-214 -17 -45 -23 -125 -100 -125 -120 0 -24 -17 -14 -42 25 -29 43 -89 88
-145 108 -41 14 -123 17 -163 5z m182 -43 c16 -7 28 -16 28 -20 0 -5 7 -8 15
-8 8 0 27 -16 42 -35 15 -20 39 -43 52 -52 23 -15 25 -14 72 35 71 75 117 96
210 97 109 0 178 -42 221 -135 45 -98 19 -228 -69 -339 -95 -121 -368 -351
-415 -351 -46 0 -317 221 -398 325 -25 31 -53 66 -62 77 -10 12 -18 29 -18 39
0 10 -4 20 -9 23 -28 18 -29 165 -1 228 22 51 89 111 141 127 42 13 155 7 191
-11z" fill="url(#heartGradient)" fill-rule="nonzero" stroke="none"/>
</g>
</svg>`;
    
    writeFileSync(outputPath, svgContent, 'utf-8');
    console.log('✅ SVG created successfully at:', outputPath);
    console.log('📏 Size:', (svgContent.length / 1024).toFixed(2), 'KB');
    console.log('✨ Features:');
    console.log('   - All paths properly closed with "z"');
    console.log('   - fill-rule="nonzero" for complete filling');
    console.log('   - stroke="none" to prevent outline gaps');
    console.log('   - Exact colors from logo.png');
    console.log('   - Gradient applied to heart');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createFilledLogoSVG();

