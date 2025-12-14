const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  // Clean dist folder
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist/unity', { recursive: true });
  fs.mkdirSync('dist/unreal', { recursive: true });

  // Build Unity target (IIFE with inline HTML)
  console.log('Building Unity target...');
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'browser',
    target: 'chrome90',
    format: 'iife',
    globalName: 'ImmutableGameBridge',
    outfile: 'dist/unity/bundle.js',
    minify: true,
    sourcemap: false,
    keepNames: true,
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    logLevel: 'info'
  });

  // Create HTML wrapper for Unity with inlined JS
  let htmlTemplate = fs.readFileSync('src/index.html', 'utf-8');
  const bundleJs = fs.readFileSync('dist/unity/bundle.js', 'utf-8');
  
  // Find and replace the script section - be explicit about what we're replacing
  const scriptStart = htmlTemplate.indexOf('<script');
  const scriptEnd = htmlTemplate.indexOf('</script>') + '</script>'.length;
  
  if (scriptStart === -1 || scriptEnd === -1) {
    throw new Error('Could not find script tags in HTML template');
  }
  
  const beforeScript = htmlTemplate.substring(0, scriptStart);
  const afterScript = htmlTemplate.substring(scriptEnd);
  
  const inlineHtml = beforeScript + `<script>\n${bundleJs}\n    </script>` + afterScript;
  
  fs.writeFileSync('dist/unity/index.html', inlineHtml);
  fs.unlinkSync('dist/unity/bundle.js');
  
  console.log(`Unity HTML created with ${(bundleJs.length / 1024 / 1024).toFixed(2)}MB of inlined JS`);

  // Build Unreal target (global format JS only)
  console.log('Building Unreal target...');
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'browser',
    target: 'chrome90',
    format: 'iife',
    globalName: 'ImmutableGameBridge',
    outfile: 'dist/unreal/index.js',
    minify: true,
    sourcemap: false,
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  console.log('✨ Build complete!');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
