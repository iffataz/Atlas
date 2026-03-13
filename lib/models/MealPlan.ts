import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface IMeal {
  name: string;
  description: string;
  ingredients: IIngredient[];
}

export interface IDayPlan {
  day: string;
  breakfast: IMeal;
  lunch: IMeal;
  dinner: IMeal;
}

export interface IShoppingItem {
  name: string;
  totalQuantity: number;
  unit: string;
  category: string;
}

export interface IMealPlan extends Document {
  preferences: string;
  servings: number;
  days: IDayPlan[];
  shoppingList: IShoppingItem[];
  createdAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
});

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [IngredientSchema],
});

const DayPlanSchema = new Schema<IDayPlan>({
  day: { type: String, required: true },
  breakfast: { type: MealSchema, required: true },
  lunch: { type: MealSchema, required: true },
  dinner: { type: MealSchema, required: true },
});

const ShoppingItemSchema = new Schema<IShoppingItem>({
  name: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
});

const MealPlanSchema = new Schema<IMealPlan>(
  {
    preferences: { type: String, required: true },
    servings: { type: Number, required: true, default: 2 },
    days: [DayPlanSchema],
    shoppingList: [ShoppingItemSchema],
  },
  { timestamps: true, collection: "meal_plans" }
);

const MealPlan: Model<IMealPlan> =
  mongoose.models.MealPlan ||
  mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);

export default MealPlan;
