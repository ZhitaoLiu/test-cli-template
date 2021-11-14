import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

import pkg from './package.json';

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  nodeResolve(),
  commonjs(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  typescript(),
  babel({ exclude: 'node_modules/**', babelHelpers: 'bundled' }),
  postcss({
    extract: true,
    modules: true,
    exec: true,
  }),
];

if (isProduction) {
  plugins.push(terser());
} else {
  const devPlugins = [
    serve({
      // open: true, // 是否打开浏览器
      port: 8080, // 监听哪一个端口
      contentBase: '.', // 服务哪一个文件夹
    }),
    livereload(),
  ];
  plugins.push(...devPlugins);
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'reactComponents',
    },
    { file: pkg.module, format: 'es' },
  ],
  plugins: [...plugins],
  external(id) {
    return /^react/.test(id);
  },
};
