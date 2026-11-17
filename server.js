// Entry point: the Express + MongoDB API lives in server/.
const server = require('./server/index.js');

// `npm start` / `node server.js` runs the server; hosts like Vercel import the app instead.
if (require.main === module) server.start();

module.exports = server.app;
