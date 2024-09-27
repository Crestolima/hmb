const mongoose = require('mongoose');

const PayDetailsSchema = new mongoose.Schema({
  roomNo: { 
    type: String, 
    required: true, 
    ref: 'Room'  // Assuming roomNo corresponds to a room's number
  },
  regNo: { 
    type: String, 
    required: true, 
    ref: 'User'  // Assuming regNo corresponds to a user's registration number
  },
  totalAmt: { 
    type: Number, 
    default: null 
  },
  paidAmt: { 
    type: Number, 
    default: null 
  },
  dueAmt: { 
    type: Number, 
    default: null 
  }
});

module.exports = mongoose.model('PayDetails', PayDetailsSchema);
