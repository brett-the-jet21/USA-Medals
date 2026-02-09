const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../public/medals-data.json'), 'utf8');
    const json = JSON.parse(data);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(json.medals || []);
  } catch (error) {
    res.status(500).json([]);
  }
};
