// Serverless function entrypoint for Vercel unified deployment
let app;

function getApp() {
  if (!app) {
    try {
      const serverModule = require('../server/dist/index.js');
      app = serverModule.default || serverModule;
    } catch (e1) {
      try {
        const serverModule = require('./server/dist/index.js');
        app = serverModule.default || serverModule;
      } catch (e2) {
        console.error('Failed to load server module:', e1);
        throw e1;
      }
    }
  }
  return app;
}

module.exports = (req, res) => {
  try {
    const expressApp = getApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Unhandled Serverless Invocation Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'ERROR',
      error: 'FUNCTION_INVOCATION_FAILED',
      message: err && err.message ? err.message : String(err),
    }));
  }
};

