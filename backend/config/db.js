import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

    // High-concurrency connection pooling configuration
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 50, // Concurrent socket pool
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,  // Keep warm sockets alive
      maxIdleTimeMS: 30000,                                      // Recycle idle sockets
      socketTimeoutMS: 45000,                                    // Prevent zombie socket hangs
      autoIndex: process.env.NODE_ENV !== 'production',          // Auto-index only in dev to save production boot memory
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name} (Pool: ${process.env.MONGO_MIN_POOL_SIZE || 5}-${process.env.MONGO_MAX_POOL_SIZE || 50})`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
