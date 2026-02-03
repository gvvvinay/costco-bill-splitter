import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertSvgToIco() {
  const svgPath = path.join(__dirname, 'public', 'splitfair-logo.svg');
  const icoPath = path.join(__dirname, 'public', 'splitfair-logo.ico');
  
  console.log('Converting SVG to ICO...');
  
  try {
    // Create multiple sizes for ICO (16x16, 32x32, 48x48, 256x256)
    const sizes = [16, 32, 48, 256];
    const pngBuffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(svgPath)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
      console.log(`Generated ${size}x${size} PNG`);
    }
    
    // For .ico, we'll use the 32x32 version as the main icon
    await sharp(svgPath)
      .resize(32, 32)
      .toFile(icoPath.replace('.ico', '-32.png'));
    
    // Also create a 512x512 version for Play Store
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'public', 'splitfair-logo-512.png'));
    
    console.log('✓ Created splitfair-logo-32.png (for ICO)');
    console.log('✓ Created splitfair-logo-512.png (for Play Store)');
    console.log('\nNote: Windows ICO format requires additional tools.');
    console.log('You can use the PNG files or convert using:');
    console.log('- Online: https://convertio.co/png-ico/');
    console.log('- ImageMagick: magick convert splitfair-logo-32.png splitfair-logo.ico');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

convertSvgToIco();
