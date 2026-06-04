const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'mock_stripe_key');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

// @desc    Create a Stripe Checkout Session
// @route   POST /api/donations/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
    }

    // 1. Create a "Pending" donation record in our database
    const donation = await Donation.create({
      user: req.user._id,
      amount,
      currency: 'inr',
      status: 'pending',
      paymentGatewayOrderId: 'awaiting_session_id' // Will update this below
    });

    // 2. If no Stripe Key is configured, fall back to simulated success
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(201).json({
        success: true,
        mockMode: true,
        donationId: donation._id,
        message: "Stripe key not configured. Fallback mock transaction active."
      });
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'NGO Cause Support Donation',
              description: 'Your contribution supports our clean-water & educational campaigns.',
            },
            unit_amount: amount * 100, // Stripe works in subunit amounts (Pence/Cents/Paisa)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // We pass the local donationId to redirect pages so the frontend can verify the status
      success_url: `http://localhost:5173/donation-status?session_id={CHECKOUT_SESSION_ID}&donation_id=${donation._id}`,
      cancel_url: `http://localhost:5173/donation-status?donation_id=${donation._id}&canceled=true`,
    });

    // Update database record with the actual Stripe Session ID
    donation.paymentGatewayOrderId = session.id;
    await donation.save();

    res.status(201).json({
      success: true,
      url: session.url, // Send URL back; frontend will redirect here
      donationId: donation._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Verify Stripe Payment Status
// @route   POST /api/donations/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { donationId, sessionId, mockSuccess } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    // Avoid reprocessing
    if (donation.status === 'success') {
      return res.status(200).json({ success: true, message: 'Payment already processed successfully', status: 'success' });
    }

    // If running in Mock Mode (No secret key set)
    if (!process.env.STRIPE_SECRET_KEY) {
      donation.status = mockSuccess ? 'success' : 'failed';
      donation.paymentGatewayPaymentId = mockSuccess ? `mock_stripe_pay_${Date.now()}` : null;
      await donation.save();
      return res.status(200).json({ success: true, status: donation.status });
    }

    // Retrieve checkout session details from Stripe API
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      donation.status = 'success';
      donation.paymentGatewayPaymentId = session.payment_intent; // Stripe Payment Intent ID
      await donation.save();
      return res.status(200).json({ success: true, status: 'success' });
    } else {
      donation.status = 'failed';
      await donation.save();
      return res.status(200).json({ success: true, status: 'failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user's transactions
// @route   GET /api/donations/my-donations
// @access  Private
router.get('/my-donations', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;