import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  variant?: string;
  price: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        variant: { type: String },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
