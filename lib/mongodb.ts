import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: mongoose.Connection | undefined;
}

export async function connectToDatabase(): Promise<mongoose.Connection> {
  if (global.mongooseConn?.readyState === 1) {
    return global.mongooseConn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  const conn = await mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
  });

  global.mongooseConn = conn.connection;
  return global.mongooseConn;
}
