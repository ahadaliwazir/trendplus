// This file bridges Vercel serverless functions to the Express backend.
// It MUST be .cjs because the root package.json has "type": "module".
const app = require('../backend/src/server');
module.exports = app;
