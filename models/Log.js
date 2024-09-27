const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  roomNo: { type: String, required: true },
  outTime: { type: Date, required: true },
  inTime: { type: Date },
  remarks: { type: String },
  status: { type: String, enum: ['out', 'in'], default: 'out' },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
