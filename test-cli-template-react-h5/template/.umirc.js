import { defineConfig } from 'umi';
import pxToViewPort from 'postcss-px-to-viewport';
import routes from './src/route/index';

const isDev = process.env.NODE_ENV === 'development';
const isSit = process.env.UMI_ENV === 'sit';

const assetDir = 'static';

// postcss-px-to-viewport 插件配置
const pxToVPConfig = {
  viewportWidth: 750, // 设计稿的视口宽度
  unitPrecision: 5, // 单位转换后保留的精度
  viewportUnit: 'vw',
  selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类
  minPixelValue: 1, // 只有大于1px的值会被转换
};

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  initialState: false, // 禁用 @umijs/plugin-initial-state 插件
  helmet: false, // 禁用 @umijs/plugin-helmet 插件
  request: false, // 禁用 @umijs/plugin-request 插件，用axios代替
  define: {
    isProdSite: false, // 全局变量
  },
  base: '/',
  history: {
    type: 'browser',
  },
  routes: routes, // 路由
  fastRefresh: {}, // 开启快速刷新功能
  mock: {
    exclude: [],
  },
  targets: {
    ie: 10,
    ios: 10,
    android: 4,
  },
  cssLoader: {
    localsConvention: 'camelCase', // 将 ClassName 类名变成驼峰命名
  },
  sass: {
    implementation: require('node-sass'), // 开启sass
  },
  chunks: isDev ? ['umi'] : ['vendors', 'common', 'umi'], // 'umi' 放最后
  chainWebpack: function (config) {
    config.merge(
      isDev
        ? {}
        : {
            output: {
              filename: 'js/[name].[chunkhash:8].js',
              chunkFilename: 'js/[name].[chunkhash:8].js',
            },
            optimization: {
              splitChunks: {
                chunks: 'all',
                minSize: 30000,
                minChunks: 1,
                automaticNameDelimiter: '.',
                cacheGroups: {
                  // 打包node_modules 中常用的包，如 umi dva react axios等
                  vendor: {
                    name: 'vendors',
                    test({ resource }) {
                      return /[\\/]node_modules[\\/](@umijs|zarm|dva|react-router|redux|react-redux|redux-saga|axios|lodash|dayjs)/.test(
                        resource,
                      );
                    },
                    priority: 20,
                  },
                  // 打包 node_modules 剩余文件
                  common: {
                    name: 'common',
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10,
                  },
                },
              },
            },
          },
    );

    // 处理 zarm 库的css文件
    config.module
      .rule('postcss-loader-to-zarm')
      .test(/node_modules\/zarm.*\.s?css$/) // 匹配 zarm的目录下所有样式文件
      .use('css-loader')
      .loader('postcss-loader')
      .options({
        plugins: [
          pxToViewPort({
            ...pxToVPConfig,
            viewportWidth: 375, // 兼容zarm库
          }),
        ],
      });

    // 全局加载 scss 文件
    const oneOfsMap = config.module.rule('sass').oneOfs.store;
    oneOfsMap.forEach((item) => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          resources: ['./src/global.scss'],
        })
        .end();
    });

    if (!isDev) {
      // 修改 js、js chunk 输出目录
      config.output
        .filename(assetDir + '/js/[name].[hash:8].js')
        .chunkFilename(assetDir + '/js/[name].[contenthash:8].chunk.js');

      // 解决 scss background 背景图片 url 路径问题
      config.module
        .rule('sass')
        .oneOf('css-modules')
        .use('extract-css-loader')
        .tap(() => ({
          publicPath: '../../', //关键
          hmr: false,
        }));
      // 修改 css 输出目录
      config.plugin('extract-css').tap(() => [
        {
          filename: assetDir + '/css/[name].[contenthash:8].css',
          chunkFilename: assetDir + '/css/[name].[contenthash:8].chunk.css',
          ignoreOrder: true,
        },
      ]);
      // 修改 图片 输出目录
      config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|webp|ico)(\?.*)?$/)
        .use('url-loader')
        .loader(require.resolve('url-loader'))
        .tap((options) => {
          const newOptions = {
            ...options,
            name: `${assetDir}/img/[name].[hash:8].[ext]`,
            fallback: {
              ...options.fallback,
              options: {
                name: `${assetDir}/img/[name].[hash:8].[ext]`,
                esModule: false,
              },
            },
          };
          return newOptions;
        });
    }
  },
  // 设置不打包的模块
  // externals: isDev
  //   ? {}
  //   : {
  //       react: 'window.React',
  //       'react-dom': 'window.ReactDOM',
  //     },
  // scripts: isDev
  //   ? []
  //   : [
  //       'https://cdn.bootcdn.net/ajax/libs/react/17.0.1/umd/react.production.min.js',
  //       'https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.1/umd/react-dom.production.min.js',
  //     ],
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'zarm',
        style: 'css',
      },
    ],
  ],

  extraPostCSSPlugins: [pxToViewPort(pxToVPConfig)],
  // 配置代理
  proxy: {
    '/api': {
      target: 'http://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  // 包模块结构分析工具
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    logLevel: 'info',
    defaultSizes: 'gzip',
  },
});
