const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pkg = require('./package.json');

// App constants
const port = process.env.PORT || 5000;
const apiPrefix = '/api';

// Store pixel data in-memory (not suited for production use!)
const db = {
  pixels: [],
};

// Create the Express app & setup middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: /http:\/\/(127(\.\d){3}|localhost)/ }));
app.options('*', cors());

// Configure routes
const router = express.Router();

// Get server infos
router.get('/', (req, res) => {
  return res.send(`${pkg.description} v${pkg.version}`);
});

// ----------------------------------------------

// Add or update a pixel
router.post('/pixels', (req, res) => {
  const { x, y, rgb, user } = req.body;

  // Check mandatory request parameters
  if (x === undefined || y === undefined || !rgb || !user) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Validate RGB value
  const rgbRegex = /^#([0-9A-F]{3}){1,2}$/i; // Accepts hex format
  if (!rgbRegex.test(rgb)) {
    return res.status(400).json({ error: 'Invalid RGB format. Use hex format.' });
  }

  // Check if pixel already exists
  const existingPixelIndex = db.pixels.findIndex(pixel => pixel.x === x && pixel.y === y);
  if (existingPixelIndex !== -1) {
    // Update existing pixel
    db.pixels[existingPixelIndex] = { x, y, rgb, user };
    return res.status(200).json(db.pixels[existingPixelIndex]);
  }

  // Create new pixel
  const newPixel = { x, y, rgb, user };
  db.pixels.push(newPixel);
  return res.status(201).json(newPixel);
});

// Delete a specified pixel
router.delete('/pixels', (req, res) => {
  const { x, y } = req.body;
  // Check mandatory request parameters
  if (x === undefined || y === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Convert x and y to numbers for comparison
  const pixelIndex = db.pixels.findIndex(pixel => pixel.x === x && pixel.y === y);
  if (pixelIndex === -1) {
    return res.status(404).json({ error: 'Pixel does not exist' ,pixel: `${x} ${y}`});
  }

  // Remove pixel
  db.pixels.splice(pixelIndex, 1);
  return res.sendStatus(204);
});


// ----------------------------------------------

// Get all pixels
router.get('/pixels', (req, res) => {
  return res.json(db.pixels);
});

// ***************************************************************************

// Add 'api` prefix to all routes
app.use(apiPrefix, router);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
