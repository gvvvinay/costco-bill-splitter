import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const width = 1024;
const height = 500;

// Create SVG for the feature graphic
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Decorative circles -->
  <circle cx="900" cy="150" r="200" fill="white" opacity="0.08"/>
  <circle cx="850" cy="420" r="150" fill="white" opacity="0.08"/>
  
  <!-- Logo -->
  <g transform="translate(60, 170)">
    <circle cx="60" cy="60" r="57" fill="rgba(255,255,255,0.12)" stroke="white" stroke-width="2.5"/>
    <circle cx="39" cy="60" r="21" fill="#10b981" stroke="#059669" stroke-width="2"/>
    <text x="39" y="68" font-size="18" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">$</text>
    <circle cx="81" cy="60" r="21" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
    <text x="81" y="68" font-size="18" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">$</text>
    <line x1="60" y1="51" x2="60" y2="69" stroke="white" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="6" fill="white"/>
  </g>
  
  <!-- App Name -->
  <text x="200" y="230" font-size="68" font-weight="700" fill="white" font-family="Arial, sans-serif">SplitFair</text>
  
  <!-- Tagline -->
  <text x="200" y="275" font-size="28" font-weight="400" fill="white" opacity="0.95" font-family="Arial, sans-serif">Split Bills Fairly &amp; Transparently</text>
  
  <!-- Features -->
  <g transform="translate(200, 320)">
    <!-- Feature 1 -->
    <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.25)"/>
    <text x="12" y="17" font-size="14" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">✓</text>
    <text x="35" y="17" font-size="18" fill="white" font-family="Arial, sans-serif">Scan Receipts</text>
    
    <!-- Feature 2 -->
    <circle cx="202" cy="12" r="12" fill="rgba(255,255,255,0.25)"/>
    <text x="202" y="17" font-size="14" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">✓</text>
    <text x="225" y="17" font-size="18" fill="white" font-family="Arial, sans-serif">Split Items</text>
    
    <!-- Feature 3 -->
    <circle cx="362" cy="12" r="12" fill="rgba(255,255,255,0.25)"/>
    <text x="362" y="17" font-size="14" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">✓</text>
    <text x="385" y="17" font-size="18" fill="white" font-family="Arial, sans-serif">Auto Calculate</text>
  </g>
</svg>
`;

async function createFeatureGraphic() {
  try {
    const outputPath = join(__dirname, 'public', 'feature-graphic.png');
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    
    console.log('✅ Feature graphic created successfully!');
    console.log(`📁 Location: ${outputPath}`);
    console.log('📐 Size: 1024 x 500 pixels');
    console.log('\n✨ Ready to upload to Google Play Console!');
  } catch (error) {
    console.error('❌ Error creating feature graphic:', error);
  }
}

createFeatureGraphic();
