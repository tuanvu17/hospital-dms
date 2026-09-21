const express = require('express');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const { protect, requireLevel } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');
const {
  canUpload,
  canView,
  canManageDoc,
  isDirector,
  ALL_DEPARTMENTS_CODE,
  VISIBILITY,
} = require('../config/levels');

const router = express.Router();

router.use(protect); // mọi route tài liệu đều yêu cầu đăng nhập

/**
 * Xây dựng bộ lọc MongoDB tương ứng quy tắc canView(), để KHÔNG phải load hết
 * tài liệu rồi lọc bằng JS (tốn tài nguyên khi dữ liệu lớn).
 */
function buildVisibilityQuery(user) {
  if (isDirector(user.level)) return {}; // Ban Giám đốc: xem tất cả

  if (user.level === 6) {
    // Người xem nội bộ: xem mọi tài liệu nội bộ + công khai, mọi đơn vị
    return { visibility: { $in: [VISIBILITY.NOI_BO, VISIBILITY.CONG_KHAI] } };
  }

  if (user.level === 7) {
    // Khách: chỉ tài liệu công khai
    return { visibility: VISIBILITY.CONG_KHAI };
  }

  // Level 3-5: tài liệu toàn viện HOẶC đúng đơn vị của mình
  return { department: { $in: [ALL_DEPARTMENTS_CODE, user.department] } };
}

// GET /api/documents - danh sách tài liệu (đã lọc theo quyền), hỗ trợ tìm kiếm & lọc đơn vị
router.get('/', async (req, res) => {
  try {
    const { q, department } = req.query;
    const filter = buildVisibilityQuery(req.user);

    if (q) filter.$text = { $search: q };

    // Lọc thêm theo 1 đơn vị cụ thể (nếu người dùng chọn trên UI), nhưng vẫn phải nằm
    // trong phạm vi quyền xem đã tính ở buildVisibilityQuery — nên gộp bằng $and thay vì ghi đè.
    if (department) {
      filter.$and = [{ department }];
    }

    const docs = await Document.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách tài liệu', error: err.message });
  }
});

// POST /api/documents - upload tài liệu mới (level 1-5)
router.post('/', requireLevel(5), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file để tải lên' });

    const { title, description, department, visibility } = req.body;
    if (!title || !department) {
      fs.unlinkSync(req.file.path); // dọn file đã lưu nếu thiếu dữ liệu
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc đơn vị' });
    }

    // Level 3-5 chỉ được đăng tài liệu cho ĐÚNG đơn vị của mình (hoặc user cấp trưởng/phó có thể chọn ALL nếu muốn dùng chung)
    if (!isDirector(req.user.level) && department !== req.user.department && department !== ALL_DEPARTMENTS_CODE) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Bạn chỉ được đăng tài liệu cho đơn vị của mình' });
    }

    const doc = await Document.create({
      title,
      description,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      department,
      visibility: visibility || VISIBILITY.NOI_BO,
      uploadedBy: req.user.id,
      uploadedByName: req.user.fullName,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tải lên tài liệu', error: err.message });
  }
});

// GET /api/documents/:id/download - tải file (kiểm tra quyền xem trước khi cho tải)
router.get('/:id/download', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  if (!canView(req.user, doc)) {
    return res.status(403).json({ message: 'Bạn không có quyền xem tài liệu này' });
  }

  const fullPath = path.join(UPLOAD_DIR, doc.filePath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: 'File không tồn tại trên server' });
  }
  res.download(fullPath, doc.originalName);
});

// DELETE /api/documents/:id - xóa tài liệu (chủ sở hữu, trưởng/phó đơn vị quản lý, hoặc BGĐ)
router.delete('/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  if (!canManageDoc(req.user, doc)) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa tài liệu này' });
  }

  const fullPath = path.join(UPLOAD_DIR, doc.filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  await doc.deleteOne();
  res.json({ message: 'Đã xóa tài liệu' });
});

module.exports = router;
