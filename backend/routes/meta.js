const express = require('express');
const { DEPARTMENTS } = require('../config/departments');
const { LEVELS, ALL_DEPARTMENTS_CODE, VISIBILITY } = require('../config/levels');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/meta - trả về danh sách đơn vị + cấp bậc để frontend build dropdown, cây tổ chức
router.get('/', protect, (req, res) => {
  res.json({
    departments: DEPARTMENTS,
    allDepartmentsCode: ALL_DEPARTMENTS_CODE,
    levels: LEVELS,
    visibility: VISIBILITY,
  });
});

module.exports = router;
