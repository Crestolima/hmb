const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  roomNo: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
