// In-memory database (not for production)
const db = {
    pixels: [],
  };
  
  export default function handler(req, res) {
    const { method } = req;
  
    if (method === 'GET') {
      // Get all pixels
      return res.status(200).json(db.pixels);
    }
  
    if (method === 'POST') {
      // Add or update a pixel
      const { x, y, rgb, user } = req.body;
  
      if (x === undefined || y === undefined || !rgb || !user) {
        return res.status(400).json({ error: 'Missing parameters' });
      }
  
      // Validate RGB format
      const rgbRegex = /^#([0-9A-F]{3}){1,2}$/i;
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
    }
  
    if (method === 'DELETE') {
      const { x, y } = req.body;
      if (x === undefined || y === undefined) {
        return res.status(400).json({ error: 'Missing parameters' });
      }
  
      const pixelIndex = db.pixels.findIndex(pixel => pixel.x === x && pixel.y === y);
      if (pixelIndex === -1) {
        return res.status(404).json({ error: 'Pixel does not exist' });
      }
  
      db.pixels.splice(pixelIndex, 1);
      return res.status(204).end();
    }
  
    return res.setHeader('Allow', ['GET', 'POST', 'DELETE']).status(405).end(`Method ${method} Not Allowed`);
  }
  