// getImage.js

import fetch from 'node-fetch';

export default async (req, res) => {
  try {
    const imagePath = req.query.imagePath;
    if (!imagePath) {
      return res.status(400).send('Image path is required.');
    }

    const imageUrl = `${encodeURIComponent(imagePath)}`;
    const response = await window.fetch(imageUrl);
    const blob = await response.blob();

    res.setHeader('Access-Control-Allow-Origin', 'https://crestscholars.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(Buffer.from(await blob.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
