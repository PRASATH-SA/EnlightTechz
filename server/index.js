require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB, isDBReady } = require('./config/db');
const { Service, Package } = require('./models');
const defaults = require('./data/defaults');

const app = express();
const PORT = process.env.PORT || 5000;
const DIST = path.join(__dirname, '..', 'dist');

app.set('trust proxy', 1);
app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN.split(',') } : undefined));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serverless (Vercel) never calls start(), so connect to MongoDB on the first request instead.
let dbReady = null;
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    if (!isDBReady()) {
      dbReady = dbReady || connectDB()
        .then((ok) => ok && seedIfEmpty().catch((err) => console.error('Seeding failed:', err.message)))
        .finally(() => { dbReady = null; });
      await dbReady;
    }
    next();
  });
}

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
}));
app.use('/api', require('./routes/public'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found.' }));

// Serve the built React app (npm run build). Only dist/ is exposed, never the project root.
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  const { injectSeo, pageMeta } = require('./lib/seo');
  const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  app.use(express.static(DIST, { maxAge: '7d', index: false, redirect: false }));
  // Every page gets its own title, description, keywords and Open Graph / WhatsApp preview tags.
  app.get('*', (req, res) => {
    const { known, noindex } = pageMeta(req.path);
    res.status(known || noindex ? 200 : 404).set('Cache-Control', 'no-cache').type('html').send(injectSeo(indexHtml, req.path));
  });
} else {
  app.get('/', (req, res) => res.send('API running. Start the site with "npm run dev", or run "npm run build" to serve it from here.'));
}

async function seedIfEmpty() {
  if ((await Service.estimatedDocumentCount()) === 0) {
    await Service.insertMany(defaults.services);
    console.log(`Seeded ${defaults.services.length} services`);
  }
  if ((await Package.estimatedDocumentCount()) === 0) {
    await Package.insertMany(defaults.packages);
    console.log(`Seeded ${defaults.packages.length} packages`);
  }
}

async function start() {
  if (await connectDB()) {
    await seedIfEmpty().catch((err) => console.error('Seeding failed:', err.message));
  }
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

if (require.main === module) start();

// Vercel's Express preset needs the app itself as the default export.
module.exports = app;
module.exports.app = app;
module.exports.start = start;
