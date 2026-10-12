import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, // Home, Work, Other
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide full name'], trim: true },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 6, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'product_manager', 'order_manager', 'editor', 'customer'],
      default: 'customer',
      index: true,
    },
    phone: { type: String, trim: true },
    addresses: [addressSchema],
    isVerified: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsUpdates: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
