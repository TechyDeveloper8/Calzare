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
    isActive: { type: Boolean, default: true, index: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginIp: { type: String },
    securityPin: { type: String, select: false },
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

// Check if account is locked due to excessive failed attempts
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts and lock account for 15 minutes after 5 failed attempts
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 15 * 60 * 1000) };
  }
  return await this.updateOne(updates);
};

// Reset login attempts upon successful authentication
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

export const User = mongoose.model('User', userSchema);
