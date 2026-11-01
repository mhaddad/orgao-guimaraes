import {defineConfig} from 'vite';

export default defineConfig(({command,isPreview})=>({
  // Keep local development at /; production and preview use the repository path.
  base: command==='serve'&&!isPreview ? '/' : '/orgao-guimaraes/',
}));
