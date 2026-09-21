const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Xác thực JWT, gắn req.user = { id, level, department, fullName, username }
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa' });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      level: user.level,
      department: user.department,
      position: user.position,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

/**
 * Chặn theo cấp bậc tối đa (số càng nhỏ quyền càng cao).
 * Dùng: requireLevel(5) => chỉ level 1-5 được đi tiếp (chặn level 6,7).
 */
function requireLevel(maxLevel) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (req.user.level > maxLevel) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
  };
}

module.exports = { protect, requireLevel };
