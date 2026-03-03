import mongoose, { Schema } from 'mongoose';

const uri = process.env.MONGODB_URI || "mongodb+srv://saadbintofayel:Saad1234@chandrabati.byubzpi.mongodb.net/?appName=Chandrabati";

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
