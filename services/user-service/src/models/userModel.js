const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userPackageSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },

    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ['data', 'voice', 'VAS'],
      required: true
    },

    validityDays: {
      type: Number,
      required: true
    },

    activatedAt: {
      type: Date,
      default: Date.now
    },

    expiresAt: {
      type: Date,
      required: true
    },

    remainingDataMB: {
      type: Number,
      default: 0
    },

    remainingMinutes: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: false } // prevents extra _id for each package object
);


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    walletBalance: {
      type: Number,
      default: 0
    },
    voice: {
      type: Number,
      default: 0
    },
    data: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    services: {
      type: [String], 
      default: [],
    },
     packageNames: {
      type: [String], 
      default: []
    },
    packages: {
      type: [userPackageSchema],
      default: []
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  // Only hash if the passwordHash field is new or modified
  if (!this.isModified('passwordHash')) return;

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
