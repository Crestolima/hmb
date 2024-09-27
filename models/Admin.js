const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }, // Default role set to 'admin'
}, {
  timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
