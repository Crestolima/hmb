const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const Admin = require("./models/Admin");
const Room = require("./models/Room");
const Booking = require("./models/Booking");
const PayDetails = require("./models/PayDetails");
const Log = require("./models/Log");
const Complaint = require("./models/Complaint");


const app = express();

// Enable CORS
app.use(cors());

// MongoDB Connection
const MONGODB_URI = "mongodb+srv://JohnnyCage:x111y000@cluster0.m9ftq.mongodb.net/hostel?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Successfully!"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware to parse JSON
app.use(express.json());

// JWT secret key
const jwtSecret = "your_jwt_secret_key";

// Function to create a default admin if not exists
async function createDefaultAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ username: "admin" });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new Admin({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("Default admin created!");
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
}

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Auth Error: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Auth Error: Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    console.error("JWT verification error:", e);
    res.status(500).json({ message: "Invalid Token" });
  }
};

// Example of a basic route for '/'
app.get('/', (req, res) => {
  res.send('Hello, from server');
});

// User login
app.post("/api/user/login", async (req, res) => {
  const { regNo, password } = req.body;

  try {
    const user = await User.findOne({ regNo });
    if (!user) {
      return res.status(400).json("User not found");
    }
    if (user.role !== "user") {
      return res.status(400).json("User not found or role mismatch");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, regNo: user.regNo },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role, regNo: user.regNo });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json("Admin not found");
    }
    if (admin.role !== "admin") {
      return res.status(400).json("Admin not found or role mismatch");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role, username: admin.username },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.json({ token, role: admin.role, username: admin.username });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Add a new room (Protected route)
app.post("/api/rooms", authenticateJWT, async (req, res) => {
  const { roomNo, roomType, roomCapacity, floor, price } = req.body;

  try {
    const newRoom = new Room({ roomNo, roomType, roomCapacity, floor, price });
    await newRoom.save();
    res.status(201).json("Room added!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch all rooms
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Update a room (Protected route)
app.put("/api/rooms/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { roomNo, roomType, roomCapacity, floor, price } = req.body;

  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { roomNo, roomType, roomCapacity, floor, price },
      { new: true }
    );
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Delete a room (Protected route)
app.delete("/api/rooms/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    await Room.findByIdAndDelete(id);
    res.json("Room deleted!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Admin creates a new user (Protected route)
app.post("/api/admin/create-user", authenticateJWT, async (req, res) => {
  const {
    firstName,
    initial,
    lastName,
    phoneNo,
    email,
    dateOfBirth,
    course,
    year,
    dateOfJoining,
    address,
    gender,
    regNo,
    password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      initial,
      lastName,
      phoneNo,
      email,
      dateOfBirth,
      course,
      year,
      dateOfJoining,
      address,
      gender,
      regNo,
      password: hashedPassword,
      role: "user", // Default role set to 'user'
    });

    await newUser.save();
    res.status(201).json("User registered!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Update a user
app.put("/api/users/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Delete a user
app.delete("/api/users/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.json("User deleted!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Add booking
app.post("/api/bookings", async (req, res) => {
  const { regNo, roomNo, dateOfBooking, payment } = req.body;

  try {
    const newBooking = new Booking({ regNo, roomNo, dateOfBooking, payment });
    await newBooking.save();
    res.status(201).json("Booking added!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch booking details by user's registration number (regNo)
app.get("/api/bookings/:regNo", async (req, res) => {
  const { regNo } = req.params;

  try {
    const booking = await Booking.findOne({ regNo })
      .populate("roomNo")
      .populate("regNo");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Add payment details
app.post("/api/payDetails", async (req, res) => {
  const { roomNo, regNo, paidAmt } = req.body;

  try {
    const room = await Room.findOne({ roomNo });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const totalAmt = room.price;
    const dueAmt = totalAmt - parseFloat(paidAmt);

    const newPayDetails = new PayDetails({
      roomNo,
      regNo,
      totalAmt,
      paidAmt: parseFloat(paidAmt),
      dueAmt,
    });

    await newPayDetails.save();
    res.status(201).json("Payment details added!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch dashboard data
app.get("/api/dashboard-data", async (req, res) => {
  try {
    const residence = await User.countDocuments({});
    const rooms = await Room.countDocuments({});
    const totalCapacity = await Room.aggregate([
      { $group: { _id: null, total: { $sum: "$roomCapacity" } } },
    ]);
    const totalBookings = await Booking.countDocuments({});
    const vacancy = totalCapacity[0].total - totalBookings;

    const data = {
      residence,
      rooms,
      totalCapacity: totalCapacity[0].total,
      vacancy,
    };

    res.json(data);
  } catch (err) {
    res.status(500).json("Error fetching dashboard data: " + err.message);
  }
});

// Cancel a booking and delete associated payment details
app.delete("/api/bookings/:regNo", async (req, res) => {
  const { regNo } = req.params;

  try {
    // Delete the booking
    const booking = await Booking.findOneAndDelete({ regNo });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Delete associated payment details
    const paymentDetails = await PayDetails.findOneAndDelete({ regNo });
    if (!paymentDetails) {
      return res.status(404).json({ message: "Payment details not found" });
    }

    res.json({ message: "Booking and associated payment details canceled" });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Fetch student details by regNo
app.get("/api/student-details/:regNo", authenticateJWT, async (req, res) => {
  const { regNo } = req.params;

  try {
    const user = await User.findOne({ regNo });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const booking = await Booking.findOne({ regNo });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const room = await Room.findOne({ roomNo: booking.roomNo });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const payDetails = await PayDetails.findOne({ regNo });
    if (!payDetails) {
      return res.status(404).json({ message: "Payment details not found" });
    }

    const details = {
      user,
      room,
      payDetails,
    };

    res.json(details);
  } catch (err) {
    res.status(500).json({ message: "Error fetching details: " + err.message });
  }
});

// Log a new entry
app.post("/api/logs", authenticateJWT, async (req, res) => {
  const { regNo, roomNo, remarks, outTime } = req.body;
  try {
    const newLog = new Log({ regNo, roomNo, remarks, outTime });
    await newLog.save();

    // Update user's currentLog field
    await User.findOneAndUpdate({ regNo }, { currentLog: newLog._id });

    res.status(201).json({ message: "Log created!" });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Update log entry
app.put("/api/logs/:regNo", authenticateJWT, async (req, res) => {
  const { regNo } = req.params;
  const { inTime } = req.body;
  try {
    const log = await Log.findOneAndUpdate(
      { regNo, inTime: null },
      { inTime },
      { new: true }
    );
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    // Clear user's currentLog field
    await User.findOneAndUpdate({ regNo }, { currentLog: null });

    res.json({ message: "Log updated!" });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

// Fetch log entries with pagination
app.get("/api/logs", authenticateJWT, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const logs = await Log.find()
      .sort({ outTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Log.countDocuments();

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

// Add a new complaint
app.post("/api/complaints", authenticateJWT, async (req, res) => {
  const { regNo, roomNo, reason } = req.body;

  try {
    const newComplaint = new Complaint({ regNo, roomNo, reason });
    await newComplaint.save();
    res.status(201).json("Complaint added!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch all complaints
app.get("/api/complaints", authenticateJWT, async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Fetch complaints for a specific user
app.get("/api/complaints/user/:regNo", authenticateJWT, async (req, res) => {
  const { regNo } = req.params;

  try {
    const complaints = await Complaint.find({ regNo });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Delete a complaint
app.delete("/api/complaints/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    await Complaint.findByIdAndDelete(id);
    res.json("Complaint deleted!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch all complaints
app.get("/api/complaints", authenticateJWT, async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Update a complaint
app.put("/api/complaints/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { reason, status } = req.body;

  console.log(
    `Received request to update complaint with id: ${id} to status: ${status}`
  );

  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log("Complaint not found");
      return res.status(404).send("Complaint not found");
    }

    if (complaint.status === "resolved") {
      console.log("Complaint is already resolved. No update performed.");
      return res.status(200).json(complaint);
    }

    complaint.reason = reason || complaint.reason;
    complaint.status = status || complaint.status;

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Fetch logs where inTime is null (not back yet)
app.get("/api/not-returned-logs", authenticateJWT, async (req, res) => {
  try {
    const logs = await Log.find({ inTime: null }).populate("regNo roomNo");
    res.json(logs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching not returned logs: " + err.message });
  }
});

// Update the payment details and recalculate dueAmt
app.put("/api/payment-details/:regNo", async (req, res) => {
  const { regNo } = req.params;
  const { newPaidAmt } = req.body;

  try {
    const payDetails = await PayDetails.findOne({ regNo });
    if (!payDetails) {
      return res.status(404).json({ message: "Payment details not found" });
    }

    const additionalPaidAmt = parseFloat(newPaidAmt) || 0;
    const updatedPaidAmt =
      (parseFloat(payDetails.paidAmt) || 0) + additionalPaidAmt;
    const updatedDueAmt =
      (parseFloat(payDetails.totalAmt) || 0) - updatedPaidAmt;

    payDetails.paidAmt = updatedPaidAmt;
    payDetails.dueAmt = updatedDueAmt;

    await payDetails.save();

    res.json(payDetails);
  } catch (err) {
    res.status(500).json({ message: "Error updating payment details" });
  }
});

// Fetch payment details for users with bookings and due amounts
app.get("/api/payment-details", async (req, res) => {
  try {
    const bookings = await Booking.find(); // Find all bookings
    const usersWithRooms = await User.find({
      regNo: { $in: bookings.map((b) => b.regNo) },
    }); // Find users in a room

    const paymentDetails = await PayDetails.find({
      regNo: { $in: usersWithRooms.map((user) => user.regNo) },
      dueAmt: { $gt: 0 },
    });

    res.json(paymentDetails);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payment details" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
