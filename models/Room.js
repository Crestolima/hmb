const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  roomType: { type: String, required: true },
  roomCapacity: { type: Number, required: true },
  floor: { type: Number, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model('Room', RoomSchema);
