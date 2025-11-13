const mongoose = require("mongoose");
require("dotenv").config();

// Disable buffering for serverless
mongoose.set('bufferCommands', false);

// Cache connection for serverless reuse
let cachedConnection = null;

exports.dbConnect = async () => {
  // Reuse existing connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("♻️  Reusing existing database connection");
    return cachedConnection;
  }

  try {
    // Close any existing connections that aren't ready
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Optimize for serverless
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log("✅ Database connected successfully");
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n⚠️  Common Solutions:");
    console.log("   1. Check if your IP is whitelisted in MongoDB Atlas (use 0.0.0.0/0 for Netlify)");
    console.log("   2. Verify MONGO_URI in .env file");
    console.log("   3. Check MongoDB Atlas cluster status");
    console.log("\n🔄 Server will continue running without database...\n");
    throw error; // Re-throw in serverless so function fails fast
  }
}
