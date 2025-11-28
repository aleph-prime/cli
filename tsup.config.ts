import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'bin/aleph': 'src/bin/aleph.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
  esbuildOptions(options) {
    options.banner = {
      js: '',
    };
  },
  async onSuccess() {
    // Add shebang only to the bin file
    const fs = await import('fs');
    const binPath = 'dist/bin/aleph.js';
    if (fs.existsSync(binPath)) {
      const content = fs.readFileSync(binPath, 'utf-8');
      if (!content.startsWith('#!/usr/bin/env node')) {
        fs.writeFileSync(binPath, `#!/usr/bin/env node\n${content}`);
      }
    }
  },
});
