const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please specify the donation amount'],
    min: [1, 'Donation must be at least 1']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  paymentGatewayOrderId: {
    type: String,
    required: true // Used to track transaction on sandbox gateway
  },
  paymentGatewayPaymentId: {
    type: String, // Filled after confirmation
    default: null
  },
  paymentGatewaySignature: {
    type: String, // Filled after validation
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on status changes
// Update the updatedAt field on status changes (Modern Syntax)
DonationSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Donation', DonationSchema);