const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

// Sub-schema for tasks
const TaskSchema = new Schema({
  taskName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  assignedTo: {
    type: String, // Reference to a User
    required:true,
    ref:'User'
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'], // Task priority
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main User Schema
const UserSchema = new Schema({
  usernameoremail: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tasks: {
    todo: [TaskSchema],      // Array of tasks in "To Do" status
    inProgress: [TaskSchema], // Array of tasks in "In Progress" status
    completed: [TaskSchema],  // Array of tasks in "Completed" status
  },
});

// Pre-save middleware to hash the password before saving it to the database
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Skip hashing if the password has not been modified
  }

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare the entered password with the hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
