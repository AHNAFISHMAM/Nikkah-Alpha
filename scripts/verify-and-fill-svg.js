import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function verifyAndFillSVG() {
  const svgPath = join(__dirname, '../public/r6yq9C01.svg');
  let svgContent = readFileSync(svgPath, 'utf-8');
  
  console.log('📋 Current SVG structure:');
  
  // Check if paths have fill attributes
  const hasCrescentFill = svgContent.includes('fill="#FFD409"');
  const hasHeartGradient = svgContent.includes('fill="url(#heartGradient)"');
  
  console.log('Crescent fill:', hasCrescentFill ? '✅' : '❌');
  console.log('Heart gradient:', hasHeartGradient ? '✅' : '❌');
  
  // Ensure proper structure
  const updatedSVG = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="300.000000pt" height="300.000000pt" viewBox="0 0 300.000000 300.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.10, written by Peter Selinger 2001-2011
</metadata>
<defs>
  <linearGradient id="heartGradient" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" style="stop-color:#7BE746;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#01E1AF;stop-opacity:1" />
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
110 11 1 -16 -23 -59 -51z" fill="#FFD409" fill-rule="nonzero"/>
<path d="M1410 1921 c-87 -27 -147 -80 -183 -160 -29 -65 -21 -188 17 -262 36
-73 137 -190 233 -270 126 -107 252 -199 272 -199 24 0 210 142 312 238 89 83
154 163 189 232 35 68 40 198 10 268 -29 66 -103 137 -161 152 -60 16 -165 8
-214 -17 -45 -23 -125 -100 -125 -120 0 -24 -17 -14 -42 25 -29 43 -89 88
-145 108 -41 14 -123 17 -163 5z m182 -43 c16 -7 28 -16 28 -20 0 -5 7 -8 15
-8 8 0 27 -16 42 -35 15 -20 39 -43 52 -52 23 -15 25 -14 72 35 71 75 117 96
210 97 109 0 178 -42 221 -135 45 -98 19 -228 -69 -339 -95 -121 -368 -351
-415 -351 -46 0 -317 221 -398 325 -25 31 -53 66 -62 77 -10 12 -18 29 -18 39
0 10 -4 20 -9 23 -28 18 -29 165 -1 228 22 51 89 111 141 127 42 13 155 7 191
-11z" fill="url(#heartGradient)" fill-rule="nonzero"/>
</g>
</svg>`;
  
  writeFileSync(svgPath, updatedSVG, 'utf-8');
  console.log('\n✅ SVG has been updated with:');
  console.log('   - Crescent: #FFD409 (golden)');
  console.log('   - Heart: Gradient from #7BE746 (green) to #01E1AF (teal)');
  console.log('   - fill-rule="nonzero" to fill all enclosed areas');
  console.log('   - All paths properly closed with "z"');
}

verifyAndFillSVG();

