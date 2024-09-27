const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  regNo: { 
    type: String, 
    required: true 
  },
  roomNo: { 
    type: String, 
    required: true 
  },
  dateOfBooking: { 
    type: Date, 
    default: Date.now 
  },
  payment: { 
    type: String, 
    default: null 
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
