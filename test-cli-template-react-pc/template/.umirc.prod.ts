import { defineConfig } from 'umi';

export default defineConfig({
  base: '/webs',
  publicPath: '/webs/',
  define: {
    isProdSite: true,
  },
})
