import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env file");
}

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log("Successfully connected to MongoDB via Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
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
