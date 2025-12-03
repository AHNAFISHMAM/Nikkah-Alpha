import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function fillSVG() {
  const svgPath = join(__dirname, '../public/r6yq9C01.svg');
  let svgContent = readFileSync(svgPath, 'utf-8');
  
  // Ensure all paths are properly closed and filled
  // Replace fill-rule to ensure all areas are filled
  svgContent = svgContent.replace(/fill-rule="evenodd"/g, 'fill-rule="nonzero"');
  
  // Ensure both paths have explicit fill and fill-rule
  // Crescent path - ensure it's filled
  svgContent = svgContent.replace(
    /(<path d="M1300 2321[^"]*"[^>]*)(fill="[^"]*")?/,
    '$1 fill="#FFD409" fill-rule="nonzero"'
  );
  
  // Heart path - ensure it's filled with gradient
  svgContent = svgContent.replace(
    /(<path d="M1410 1921[^"]*"[^>]*)(fill="[^"]*")?/,
    '$1 fill="url(#heartGradient)" fill-rule="nonzero"'
  );
  
  // Ensure the group has fill-rule="nonzero"
  svgContent = svgContent.replace(
    /(<g[^>]*fill-rule=")[^"]*(")/,
    '$1nonzero$2'
  );
  
  // Add explicit fill to group if missing
  if (!svgContent.includes('<g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"')) {
    svgContent = svgContent.replace(
      /(<g transform="translate\(0\.000000,300\.000000\) scale\(0\.100000,-0\.100000\)"[^>]*>)/,
      '$1'
    );
  }
  
  // Ensure paths end with 'z' to close them properly
  // Check if paths are closed
  const crescentPathMatch = svgContent.match(/<path d="M1300 2321[^"]*"/);
  if (crescentPathMatch && !crescentPathMatch[0].endsWith('z"')) {
    svgContent = svgContent.replace(
      /(<path d="M1300 2321[^"]*)([^z])"/,
      '$1z"'
    );
  }
  
  const heartPathMatch = svgContent.match(/<path d="M1410 1921[^"]*"/);
  if (heartPathMatch && !heartPathMatch[0].endsWith('z"')) {
    svgContent = svgContent.replace(
      /(<path d="M1410 1921[^"]*)([^z])"/,
      '$1z"'
    );
  }
  
  // Write the updated SVG
  writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('✅ SVG updated with proper fills');
  console.log('✅ All paths are now properly closed and filled');
}

fillSVG();

