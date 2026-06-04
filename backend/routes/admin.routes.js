const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get Admin Dashboard Metrics (Aggregated totals)
// @route   GET /api/admin/metrics
// @access  Private/Admin
router.get('/metrics', protect, adminOnly, async (req, res) => {
  try {
    // 1. Count total registered users
    const totalRegistrations = await User.countDocuments({ role: 'user' });

    // 2. Count successful donation records
    const successfulDonationsCount = await Donation.countDocuments({ status: 'success' });

    // 3. Aggregate total donation amount (Only counting status === 'success')
    const totalDonationsAmount = await Donation.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRaised = totalDonationsAmount.length > 0 ? totalDonationsAmount[0].total : 0;

    res.status(200).json({
      success: true,
      metrics: {
        totalRegistrations,
        successfulDonationsCount,
        totalRaised,
        currency: 'INR'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get Registered Users with basic filtering
// @route   GET /api/admin/registrations
// @access  Private/Admin
router.get('/registrations', protect, adminOnly, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    // Basic search filtering (Name or Email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filtering (user/admin)
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get All Donation Records (Track transaction status and timestamps)
// @route   GET /api/admin/donations
// @access  Private/Admin
router.get('/donations', protect, adminOnly, async (req, res) => {
  try {
    // Populate retrieves the associated User document's name and email
    const donations = await Donation.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Export Registrations as CSV data
// @route   GET /api/admin/registrations/export
// @access  Private/Admin
router.get('/registrations/export', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    // Define CSV Headers
    let csvContent = 'User ID,Name,Email,Registration Date\n';

    // Append user rows
    users.forEach(user => {
      const dateString = new Date(user.createdAt).toISOString().split('T')[0];
      // Escape commas to prevent breaking column structures
      const nameEscaped = user.name.replace(/,/g, '');
      const emailEscaped = user.email.replace(/,/g, '');
      
      csvContent += `${user._id},${nameEscaped},${emailEscaped},${dateString}\n`;
    });

    // Set response headers to prompt a file download on frontend
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ngo_registrations.csv');
    
    return res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;