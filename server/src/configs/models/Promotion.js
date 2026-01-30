import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['sale', 'discount', 'bundle', 'flash_sale', 'seasonal'],
    required: true,
    default: 'sale'
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  // Maximum discount for fixed amount or percentage cap
  maxDiscount: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  categories: [{
    type: String
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String
  },
  bannerText: {
    type: String,
    trim: true
  },
  minPurchaseAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  maxUsagePerUser: {
    type: Number,
    min: 0
  },
  totalUsageLimit: {
    type: Number,
    min: 0
  },
  currentUsage: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ type: 1 });

export default mongoose.model('Promotion', promotionSchema);















