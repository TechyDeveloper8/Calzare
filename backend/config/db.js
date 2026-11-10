import mongoose from 'mongoose';

/**
 * Normalizes MongoDB URIs to prevent malformed credential crashes:
 * - Auto-encodes unescaped '@' in passwords (e.g. 'pass@@host' -> 'pass%40@host')
 * - Ensures a production database path exists on SRV clusters
 */
export const formatMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;
  let sanitized = rawUri.trim();

  // Self-heal passwords ending or containing unescaped '@' before host
  sanitized = sanitized.replace(/:([^:@]+)@@/, (_, pass) => ':' + encodeURIComponent(pass + '@') + '@');

  // If no database name is specified in standard mongodb:// or mongodb+srv://
  // (e.g. mongodb://host:27017 or mongodb://user:pass@host:27017?authSource=admin)
  if (/^mongodb(\+srv)?:\/\/[^/?]+\/?(\?.*)?$/.test(sanitized)) {
    sanitized = sanitized.replace(/^mongodb(\+srv)?:\/\/([^/?]+)\/?(\?.*)?$/, (_, srv, host, query) => {
      const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
      return `mongodb${srv || ''}://${host}/calzare_production${q}`;
    });
  }

  return sanitized;
};

export const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';
    const mongoUri = formatMongoUri(rawUri);

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
