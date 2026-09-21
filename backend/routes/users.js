const express = require('express');
const User = require('../models/User');
const { protect, requireLevel } = require('../middleware/auth');

const router = express.Router();

// Tất cả route dưới đây yêu cầu đăng nhập + chỉ Ban Giám đốc (level 1-2) được quản lý tài khoản
router.use(protect, requireLevel(2));

// GET /api/users - danh sách người dùng
router.get('/', async (req, res) => {
  const users = await User.find().select('-password').sort({ department: 1, level: 1 });
  res.json(users);
});

// POST /api/users - tạo người dùng mới
router.post('/', async (req, res) => {
  try {
    const { username, password, fullName, position, department, level } = req.body;
    if (!username || !password || !fullName || !department || !level) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    const exists = await User.findOne({ username: username.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });

    const user = await User.create({ username, password, fullName, position, department, level });
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ message: 'Không thể tạo người dùng', error: err.message });
  }
});

// PUT /api/users/:id - cập nhật thông tin / khóa-mở tài khoản
router.put('/:id', async (req, res) => {
  try {
    const { fullName, position, department, level, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (fullName !== undefined) user.fullName = fullName;
    if (position !== undefined) user.position = position;
    if (department !== undefined) user.department = department;
    if (level !== undefined) user.level = level;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password; // sẽ được hash lại nhờ pre-save hook

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ message: 'Không thể cập nhật người dùng', error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  res.json({ message: 'Đã xóa người dùng' });
});

module.exports = router;
