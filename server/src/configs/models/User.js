import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google OAuth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  role: {
    type: String,
    enum: ['individual', 'product provider', 'buyer', 'seller', 'admin', 'super admin', 'marketing team', 'customer support', 'support team'],
    default: 'individual'
  },
  providerType: {
    type: String,
    enum: ['freelancer', 'small business', 'specialized'],
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  alternativePhone: {
    type: String,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  telegram: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  referralCode: {
    type: String,
    trim: true
  },
  idDocument: {
    type: String, // URL or file path
    default: ''
  },
  companyName: {
    type: String,
    trim: true
  },
  serviceType: {
    type: String,
    trim: true
  },
  workExperience: {
    type: Number,
    default: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },
  serviceCenterPhotos: [{
    type: String // Array of URLs or file paths
  }],
  introductionVideo: {
    type: String,
    default: ''
  },
  servicePriceList: {
    type: String,
    default: ''
  },
  crCertificate: {
    type: String,
    default: ''
  },
  professionalCertificate: {
    type: String,
    default: ''
  },
  portfolioPhotos: [{
    type: String
  }],
  privacyConsent: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: '' // Logo for product providers/sellers
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  if (!this.password) return; // Skip if password is not provided (Google OAuth users)
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);


