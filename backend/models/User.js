const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DEPARTMENT_CODES } = require('../config/departments');
const { ALL_DEPARTMENTS_CODE } = require('../config/levels');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true, trim: true },
    position: { type: String, trim: true, default: '' }, // Chức danh hiển thị, vd "Trưởng khoa A1"
    department: {
      type: String,
      required: true,
      enum: [...DEPARTMENT_CODES, ALL_DEPARTMENTS_CODE],
    },
    level: { type: Number, required: true, min: 1, max: 7 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
