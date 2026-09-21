const mongoose = require('mongoose');
const { DEPARTMENT_CODES } = require('../config/departments');
const { ALL_DEPARTMENTS_CODE, VISIBILITY } = require('../config/levels');

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },

    fileName: { type: String, required: true }, // tên file lưu trên server (đã đổi tên tránh trùng)
    originalName: { type: String, required: true }, // tên file gốc người dùng upload
    filePath: { type: String, required: true }, // đường dẫn tương đối trong /uploads
    fileType: { type: String, required: true }, // mime type
    fileSize: { type: Number, required: true }, // bytes

    department: {
      type: String,
      required: true,
      enum: [...DEPARTMENT_CODES, ALL_DEPARTMENTS_CODE],
    },
    visibility: {
      type: String,
      enum: Object.values(VISIBILITY),
      default: VISIBILITY.NOI_BO,
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedByName: { type: String, required: true }, // lưu kèm để hiển thị nhanh không cần populate
  },
  { timestamps: true }
);

DocumentSchema.index({ department: 1, createdAt: -1 });
DocumentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Document', DocumentSchema);
