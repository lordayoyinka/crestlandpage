// netlify/functions/getImage.js

import fetch from 'node-fetch';

export const handler = async (event, context) => {
  try {
    const imagePath = event.queryStringParameters?.imagePath;
    if (!imagePath) {
      return {
        statusCode: 400,
        body: 'Image path is required.',
      };
    }

    const imageUrl = decodeURIComponent(imagePath);
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: 'Failed to fetch image.',
      };
    }

    const buffer = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': 'https://crestscholars.com',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Cache-Control': 'public, max-age=31536000',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
