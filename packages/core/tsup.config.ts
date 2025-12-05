import {defineConfig} from 'tsup';
import {readFileSync} from 'fs';
import {resolve} from 'path';

// Read package.json to inject version info
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // Dual format: CommonJS + ES modules
  dts: true, // Generate TypeScript declarations
  splitting: false, // Keep bundle simple for SDK
  sourcemap: true,
  clean: true,
  external: [], // No externals for framework-agnostic core
  minify: true,
  target: 'es2018', // Browser compatibility
  define: {
    __PACKAGE_NAME__: JSON.stringify(packageJson.name),
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});
