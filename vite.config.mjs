import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const outDir = resolve(import.meta.dirname, 'build');
export default defineConfig({
	build: {
		outDir, emptyOutDir: false, target: 'es2023', sourcemap: true,
		lib: { entry: resolve(import.meta.dirname, 'src/ckeditor.js'), formats: ['es'], fileName: () => 'ckeditor.js', cssFileName: 'ckeditor' }
	},
	plugins: [{ name: 'vieapps-editor-manifest', closeBundle() {
		const core = resolve(import.meta.dirname, 'node_modules/ckeditor5');
		for (const file of ['LICENSE.md', 'COPYING.GPL']) copyFileSync(resolve(core, file), resolve(outDir, file));
		const artifacts = ['COPYING.GPL', 'LICENSE.md', 'ckeditor.css', 'ckeditor.js', 'ckeditor.js.map'];
		const files = Object.fromEntries(artifacts.map(name => [name, createHash('sha256').update(readFileSync(resolve(outDir, name))).digest('hex')]));
		writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify({ engine: '49.1.0', bundler: '8.1.7', licenseMode: 'GPL', languages: ['en','vi'], files }, null, 2) + '\n');
	} }]
});
