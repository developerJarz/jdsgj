import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMegaMenuChild {
  label: string;
  href: string;
}

export interface IMegaMenuItem {
  label: string;
  href: string;
  icon?: string;
  children?: IMegaMenuChild[];
}

export interface IMegaMenu extends Document {
  title: string;
  slug: string;
  type: 'link' | 'dropdown' | 'mega';
  position: number;
  isActive: boolean;
  href?: string;
  items: IMegaMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MegaMenuSchema = new Schema<IMegaMenu>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['link', 'dropdown', 'mega'], default: 'link' },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    href: { type: String, default: '/' },
    items: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        icon: { type: String },
        children: [
          {
            label: { type: String },
            href: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const MegaMenu: Model<IMegaMenu> =
  mongoose.models.MegaMenu || mongoose.model<IMegaMenu>('MegaMenu', MegaMenuSchema);
