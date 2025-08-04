const packager = require('@electron/packager');
const path = require('path');

async function buildApp() {
  const options = {
    dir: '.',
    name: 'silverhand-mod-loader', 
    platform: 'win32',
    arch: 'x64',
    out: 'dist',
    overwrite: true,
    prune: true,
    quiet: false,
    derefSymlinks: false,
    
    // Ultra-aggressive size optimizations
    extraResource: [],
    
    ignore: [
      // Development files (regex patterns)
      /^\/src\//,
      /^\/public\/index\.html$/,
      /^\/tailwind\.config\.js$/,
      /^\/postcss\.config\.js$/,
      /^\/README\.md$/,
      /^\/RELEASE_0\.0\.1\.md$/,
      /^\/electron-pack\.js$/,
      /^\/\.git/,
      /^\/\.gitignore$/,
      /^\/\.packagerignore$/,
      /^\/dist\//,
      /^\/mods\//,
      /^\/merged_runtime\//,
      /^\/virtual_game\//,
      /^\/modloader-app\//,
      /^\/config\//,
      
      // Heavy dev dependencies that shouldn't be there anyway
      /node_modules\/react-scripts/,
      /node_modules\/webpack/,
      /node_modules\/@babel/,
      /node_modules\/eslint/,
      /node_modules\/concurrently/,
      
      // Documentation and dev files
      /\/README/,
      /\/readme/,
      /\/CHANGELOG/,
      /\/changelog/,
      /\/LICENSE/,
      /\/license/,
      /\/COPYING/,
      /\/AUTHORS/,
      /\/CONTRIBUTORS/,
      /\.md$/,
      /\.txt$/,
      /\.markdown$/,
      
      // Test files
      /\.test\./,
      /\.spec\./,
      /\/__tests__\//,
      /\/test\//,
      /\/tests\//,
      /\/spec\//,
      /\/testing\//,
      
      // Source maps and TypeScript
      /\.map$/,
      /\.d\.ts$/,
      /\.ts$/,
      /\.tsx$/,
      /tsconfig/,
      
      // Various dev/build files
      /\.eslintrc/,
      /\.prettierrc/,
      /\.babelrc/,
      /webpack\.config/,
      /rollup\.config/,
      /vite\.config/,
      /jest\.config/,
      /\.nyc_output/,
      /coverage\//,
      
      // Examples and docs directories
      /\/examples\//,
      /\/docs\//,
      /\/documentation\//,
      /\/sample/,
      /\/demo/,
      
      // Locale files (if not needed)
      /\/locale\//,
      /\/locales\//,
      /\/l10n\//,
      /\/i18n\//,
      
      // Unused binary platforms
      /\/bin\/darwin/,
      /\/bin\/linux/,
      /\/prebuilds\/darwin/,
      /\/prebuilds\/linux/,
      
      // Cache and temp files  
      /\.cache/,
      /\.tmp/,
      /\.temp/,
      /node_modules\/\.cache/
    ]
  };

  try {
    const appPaths = await packager(options);
    console.log('✅ Build complete!');
    console.log('📦 App packaged to:', appPaths[0]);
  } catch (error) {
    console.error('❌ Build failed:', error);
  }
}

buildApp();