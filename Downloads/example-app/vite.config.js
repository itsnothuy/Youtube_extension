import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

const popupPath = resolve(__dirname, 'src/popup/popup.html');
const backgroundPath = resolve(__dirname, 'src/background.jsx');
const contentScriptPath = resolve(__dirname, 'src/contentScript.jsx');

console.log("Popup Path:", popupPath);
console.log("Background Path:", backgroundPath);
console.log("Content Script Path:", contentScriptPath);

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: popupPath,
        background: backgroundPath,
        contentScript: contentScriptPath
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  publicDir: 'public'
});
