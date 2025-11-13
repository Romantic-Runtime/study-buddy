const serverless = require('serverless-http');
const app = require('../../server');
const { dbConnect } = require('../../config/database');

// Wrap the handler to ensure database connection before each request
exports.handler = async (event, context) => {
  // Ensure database is connected
  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection failed in serverless function:', error);
    // Continue anyway - some endpoints might not need DB
  }

  // Use serverless-http to handle the request
  const handler = serverless(app);
  return handler(event, context);
};
