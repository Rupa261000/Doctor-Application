const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");


/// for registering the user
const registerController = async (req, res) => {
  try {
    const { fullName, email, password, phone, type } = req.body;

    console.log("Register request body:", { fullName, email, phone, type });

    // Validate required fields
    if (!fullName || !email || !password || !phone || !type) {
      return res.status(400).send({
        success: false,
        message: "Please provide fullName, email, password, phone, and type",
      });
    }

    const existsUser = await userSchema.findOne({ email: email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userSchema({
      fullName,
      email,
      password: hashedPassword,
      phone,
      type,
    });
    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.error("RegisterController error:", error);
    console.error(error.stack);
    return res
      .status(500)
      .send({ success: false, message: "Registration failed: " + error.message });
  }
};


////for the login
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    user.password = undefined;
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.error("LoginController error:", error);
    return res
      .status(500)
      .send({ success: false, message: "Login failed: " + error.message });
  }
};


////auth controller
const authController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });

    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};

/////for the doctor registration of user
const mongoose = require("mongoose");

const docController = async (req, res) => {
  try {
    const { doctor, userId } = req.body;

    console.log("Received doctor data:", doctor);
    console.log("Received userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return res.status(400).send({
        success: false,
        message: "Invalid userId",
      });
    }

    const userExists = await userSchema.findById(userId);
    if (!userExists) {
      console.error("User not found for userId:", userId);
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    // Validate timings field
    if (!doctor.timings || typeof doctor.timings !== 'object' || !doctor.timings.start || !doctor.timings.end) {
      console.error("Invalid timings data:", doctor.timings);
      return res.status(400).send({
        success: false,
        message: "Invalid timings data",
      });
    }

    const newDoctor = new docSchema({
      ...doctor,
      userId: userId.toString(),
      status: "pending",
    });
    await newDoctor.save();

    const adminUser = await userSchema.findOne({ type: "admin" });
    if (!adminUser) {
      console.error("Admin user not found in database");
      return res.status(500).send({
        success: false,
        message: "Admin user not found",
      });
    }

    const notification = adminUser.notification || [];
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.fullName} has applied for doctor registration`,
      data: {
        userId: newDoctor._id,
        fullName: newDoctor.fullName,
        onClickPath: "/admin/doctors",
      },
    });

    await userSchema.findByIdAndUpdate(adminUser._id, { notification });

    return res.status(201).send({
      success: true,
      message: "Doctor Registration request sent successfully",
    });
  } catch (error) {
    console.error("Error in docController:", error);
    res
      .status(500)
      .send({ message: "error while applying", success: false, error: error.message });
  }
};


////for the notification 
const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;

    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = seennotification;

    const updatedUser = await user.save();
    return res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "unable to fetch", success: false, error });
  }
};


////for deleting the notification
const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];

    const updatedUser = await user.save();
    updatedUser.password = undefined;
    return res.status(200).send({
      success: true,
      message: "notification deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "unable to delete", success: false, error });
  }
};

////displaying all doctors in user profile
const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({ status: "approved" });
    return res.status(200).send({
      message: "doctor Users data list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console
      .log(error)
      .status(500)
      .send({ message: "something went wrong", success: false, error });
  }
};

////getting appointments done in user
const appointmentController = async (req, res) => {
  try {
    let { userInfo, doctorInfo } = req.body;
    userInfo = JSON.parse(userInfo)
    doctorInfo = JSON.parse(doctorInfo)

    let documentData = null;
    if (req.file) {
      documentData = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      };
    }

    req.body.status = "pending";
    
    const newAppointment = new appointmentSchema({
      userId: req.body.userId,
      doctorId: req.body.doctorId,
      userInfo: userInfo,
      doctorInfo: doctorInfo,
      date: req.body.date,
      document: documentData,
      status: req.body.status,
    });

    await newAppointment.save();

    const user = await userSchema.findOne({ _id: doctorInfo.userId });

    if (user) {
      user.notification.push({
        type: "New Appointment",
        message: `New Appointment request from ${userInfo.fullName}`,
      });

      await user.save();
    }

    return res.status(200).send({
      message: "Appointment book successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "something went wrong", success: false, error });
  }
};

const getAllUserAppointments = async (req, res) => {
  try {
    const allAppointments = await appointmentSchema.find({
      userId: req.body.userId,
    });

    const doctorIds = allAppointments.map(
      (appointment) => appointment.doctorId
    );

    const doctors = await docSchema.find({
      _id: { $in: doctorIds },
    });

    const appointmentsWithDoctor = allAppointments.map((appointment) => {
      const doctor = doctors.find(
        (doc) => doc._id.toString() === appointment.doctorId.toString()
      );
      const docName = doctor ? doctor.fullName : "";
      return {
        ...appointment.toObject(),
        docName,
      };
    });
    return res.status(200).send({
      message: "All the appointments are listed below.",
      success: true,
      data: appointmentsWithDoctor,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "something went wrong", success: false, error });
  }
};

const getDocsController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const allDocs = user.documents;
    if (!allDocs) {
      return res.status(201).send({
        message: "No documnets",
        success: true,
      });
    }
    return res.status(200).send({
      message: "All the appointments are listed below.",
      success: true,
      data: allDocs,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "something went wrong", success: false, error });
  }
};



module.exports = {
  registerController,
  loginController,
  authController,
  docController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
};
