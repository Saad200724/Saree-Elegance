import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env file");
}

export const connectToMongoDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    // Removing some restrictive options to see if it helps with the connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 45000, 
      connectTimeoutMS: 45000,
      socketTimeoutMS: 60000,
    });
    console.log("Successfully connected to MongoDB Atlas via Mongoose");
  } catch (error) {
    console.error("CRITICAL: MongoDB Connection Failed!", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Name:", error.name);
    }
  }
};

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  originalPrice: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  bufferCommands: false // Disable buffering
});

export const MongoProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const ReviewSchema: Schema = new Schema({
  productId: { type: Number, required: true },
  userId: { type: String },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const MongoReview = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
