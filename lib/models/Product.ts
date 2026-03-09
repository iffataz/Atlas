import mongoose, { Schema, Model } from "mongoose";

export interface IProduct {
  index?: number;
  Postal_code?: number;
  Category?: string;
  Sub_category?: string;
  Product_Group?: string;
  Product_Name?: string;
  Package_price?: number;
  Price_per_unit?: string;
  package_size?: string;
  is_estimated?: number;
  is_special?: number;
  Product_Url?: string;
  Brand?: string;
  Sku?: string;
  RunDate?: string;
  unit_price?: number;
  unit_price_unit?: string;
  state?: string;
  city?: string;
  tid?: number;
}

const productSchema = new Schema<IProduct>({
  index: Number,
  Postal_code: Number,
  Category: String,
  Sub_category: String,
  Product_Group: String,
  Product_Name: String,
  Package_price: Number,
  Price_per_unit: String,
  package_size: String,
  is_estimated: Number,
  is_special: Number,
  Product_Url: String,
  Brand: String,
  Sku: String,
  RunDate: String,
  unit_price: Number,
  unit_price_unit: String,
  state: String,
  city: String,
  tid: Number,
});

// Prevent model re-compilation during hot reloads in dev
const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", productSchema, "vic_catalog_nodupe");

export default Product;
