import { defineConfig } from 'umi';
import routes from './src/route/index';

const isDev = process.env.NODE_ENV === 'development';
const isSit = process.env.UMI_ENV === 'sit';

const assetDir = 'static';

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
  base: '/', // 路由前缀
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
  },
  cssLoader: {
    localsConvention: 'camelCase', // 将 ClassName 类名变成驼峰命名
  },
  chunks: isDev ? ['umi'] : ['vendors', 'common', 'umi'], // 'umi' 放最后
  chainWebpack: function (config) {
    config.merge(
      isDev
        ? {}
        : {
            optimization: {
              splitChunks: {
                chunks: 'all',
                minSize: 30000,
                minChunks: 1,
                automaticNameDelimiter: '.',
                cacheGroups: {
                  // 打包node_modules 中常用的包，如 umi dva axios antd等
                  // 如果 react react-dom 采用 cdn资源，则不打包进来
                  vendor: {
                    name: 'vendors',
                    test({ resource }: {resource : any}) {
                      return /[\\/]node_modules[\\/](@umijs|dva|axios|lodash|dayjs|antd|@ant-design|rc-.*)/.test(
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

    config.plugin('antdDayjsWebpackPlugin').use('antd-dayjs-webpack-plugin')

    if(!isDev) {
      // 修改 js、js chunk 输出目录
      config.output
        .filename(assetDir + '/js/[name].[hash:8].js')
        .chunkFilename(assetDir + '/js/[name].[contenthash:8].chunk.js');

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
  externals: isDev
    ? {}
    : {
        'react': 'window.React',
        'react-dom': 'window.ReactDOM',
      },
  scripts: isDev
    ? []
    : [
        'https://cdn.bootcdn.net/ajax/libs/react/17.0.1/umd/react.production.min.js',
        'https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.1/umd/react-dom.production.min.js',
      ],

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
  }

});
