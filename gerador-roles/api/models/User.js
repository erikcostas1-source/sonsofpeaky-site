/**
 * User Model - Modelo de Usuário
 * Gerador de Rolês API
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
    select: false // Don't include password in queries by default
  },

  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },

  lastname: {
    type: String,
    trim: true,
    maxlength: [50, 'Sobrenome deve ter no máximo 50 caracteres']
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (xx) xxxxx-xxxx']
  },

  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Localização deve ter no máximo 100 caracteres']
  },

  bike: {
    type: String,
    trim: true,
    maxlength: [50, 'Modelo da moto deve ter no máximo 50 caracteres']
  },

  avatar: {
    type: String,
    default: null
  },

  // Account Status
  verified: {
    type: Boolean,
    default: false
  },

  verificationToken: {
    type: String,
    select: false
  },

  verifiedAt: {
    type: Date
  },

  active: {
    type: Boolean,
    default: true
  },

  // Subscription Information
  plan: {
    type: String,
    enum: ['FREE', 'PREMIUM', 'PRO', 'ENTERPRISE'],
    default: 'FREE'
  },

  subscriptionId: {
    type: String,
    default: null
  },

  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'],
    default: null
  },

  planStartDate: {
    type: Date
  },

  planEndDate: {
    type: Date
  },

  // Usage Tracking
  monthlyGenerationsUsed: {
    type: Number,
    default: 0
  },

  lastGenerationReset: {
    type: Date,
    default: Date.now
  },

  totalGenerations: {
    type: Number,
    default: 0
  },

  // Security
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },

  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },

  lockUntil: {
    type: Date,
    select: false
  },

  passwordChangedAt: {
    type: Date
  },

  passwordResetToken: {
    type: String,
    select: false
  },

  passwordResetExpires: {
    type: Date,
    select: false
  },

  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      shareData: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: false }
    },
    ai: {
      creativity: { type: Number, default: 0.8, min: 0, max: 1 },
      includeOffRoad: { type: Boolean, default: false },
      preferNature: { type: Boolean, default: true },
      avoidTolls: { type: Boolean, default: false }
    }
  },

  // Social Login
  googleId: {
    type: String,
    sparse: true
  },

  facebookId: {
    type: String,
    sparse: true
  },

  // Metadata
  lastLogin: {
    type: Date
  },

  ipAddress: {
    type: String
  },

  userAgent: {
    type: String
  },

  // Newsletter
  newsletter: {
    type: Boolean,
    default: false
  },

  newsletterToken: {
    type: String
  }

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ plan: 1 });
userSchema.index({ subscriptionId: 1 }, { sparse: true });
userSchema.index({ verificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.lastname) {
    return `${this.name} ${this.lastname}`;
  }
  return this.name;
});

// Virtual for plan limits
userSchema.virtual('planLimits').get(function() {
  const limits = {
    FREE: { generations: 5, features: ['basic'] },
    PREMIUM: { generations: 50, features: ['basic', 'pdf_export', 'priority_support'] },
    PRO: { generations: 200, features: ['basic', 'pdf_export', 'api_access', 'analytics', 'white_label'] },
    ENTERPRISE: { generations: -1, features: ['all'] }
  };
  
  return limits[this.plan] || limits.FREE;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update password changed timestamp
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure JWT is created after password change
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  
  return false;
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to check if user can generate more roteiros
userSchema.methods.canGenerate = function() {
  if (this.plan === 'ENTERPRISE') return true;
  
  const limits = this.planLimits;
  if (limits.generations === -1) return true;
  
  // Check if we need to reset monthly counter
  const now = new Date();
  const lastReset = new Date(this.lastGenerationReset);
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.monthlyGenerationsUsed = 0;
    this.lastGenerationReset = now;
    this.save();
  }
  
  return this.monthlyGenerationsUsed < limits.generations;
};

// Method to increment generation count
userSchema.methods.incrementGenerations = async function() {
  this.monthlyGenerationsUsed += 1;
  this.totalGenerations += 1;
  await this.save();
};

// Method to check if user has feature access
userSchema.methods.hasFeature = function(feature) {
  const planFeatures = this.planLimits.features;
  return planFeatures.includes('all') || planFeatures.includes(feature);
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get plan statistics
userSchema.statics.getPlanStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] } }
      }
    }
  ]);
};

// Static method for cleanup (remove unverified users after 7 days)
userSchema.statics.cleanupUnverified = function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    verified: false,
    createdAt: { $lt: sevenDaysAgo }
  });
};

// Post-save hook for logging
userSchema.post('save', function(doc) {
  if (this.isNew) {
    console.log(`New user created: ${doc.email}`);
  }
});

// Export model
const User = mongoose.model('User', userSchema);

module.exports = User;