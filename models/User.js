const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  initial: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  dateOfJoining: { type: Date, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female'] }, // Ensure enum matches frontend values
  regNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  currentLog: { type: mongoose.Schema.Types.ObjectId, ref: 'Log', default: null },
});

module.exports = mongoose.model('User', UserSchema);
