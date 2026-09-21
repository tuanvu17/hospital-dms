/**
 * Chạy: npm run seed
 * Tạo sẵn 1 vài tài khoản mẫu để đăng nhập thử nghiệm ngay.
 * Mật khẩu mẫu cho TẤT CẢ tài khoản: 123456  (đổi ngay sau khi bàn giao thực tế!)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { ALL_DEPARTMENTS_CODE } = require('../config/levels');

const SAMPLE_USERS = [
  { username: 'giamdoc', password: '123456', fullName: 'Nguyễn Văn A', position: 'Giám đốc', department: ALL_DEPARTMENTS_CODE, level: 1 },
  { username: 'phogiamdoc', password: '123456', fullName: 'Trần Thị B', position: 'Phó Giám đốc', department: ALL_DEPARTMENTS_CODE, level: 2 },
  { username: 'truongkhoaa1', password: '123456', fullName: 'Lê Văn C', position: 'Trưởng khoa A1', department: 'KHOA_A1', level: 3 },
  { username: 'phokhoaa1', password: '123456', fullName: 'Phạm Thị D', position: 'Phó khoa A1', department: 'KHOA_A1', level: 4 },
  { username: 'nhanviena1', password: '123456', fullName: 'Hoàng Văn E', position: 'Nhân viên khoa A1', department: 'KHOA_A1', level: 5 },
  { username: 'nhanvientocntt', password: '123456', fullName: 'Vũ Thị F', position: 'Nhân viên Tổ CNTT', department: 'TO_CNTT', level: 5 },
  { username: 'xemnoibo', password: '123456', fullName: 'Đặng Văn G', position: 'Người xem nội bộ', department: ALL_DEPARTMENTS_CODE, level: 6 },
  { username: 'khach', password: '123456', fullName: 'Khách', position: 'Khách', department: ALL_DEPARTMENTS_CODE, level: 7 },
];

async function run() {
  await connectDB();

  for (const u of SAMPLE_USERS) {
    const exists = await User.findOne({ username: u.username });
    if (exists) {
      console.log(`- Bỏ qua (đã tồn tại): ${u.username}`);
      continue;
    }
    await User.create(u);
    console.log(`+ Đã tạo: ${u.username} (level ${u.level}, ${u.department})`);
  }

  console.log('\nHoàn tất seed dữ liệu. Mật khẩu mẫu cho mọi tài khoản: 123456');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
