import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base './' keeps asset paths relative so the build works on
// GitHub Pages (repo subpath), Netlify, Vercel or any static host.
export default defineConfig({
  plugins: [svelte()],
  base: './',
})
