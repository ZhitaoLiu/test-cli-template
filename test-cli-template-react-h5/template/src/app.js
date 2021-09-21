// 应用入口

if (process.env.NODE_ENV !== 'development' && !isProdSite) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const VConsole = require('vconsole');
  // eslint-disable-next-line no-new
  new VConsole();
}
