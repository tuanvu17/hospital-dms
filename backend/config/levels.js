/**
 * Mô hình phân quyền ĐƠN GIẢN theo cấp bậc (số càng nhỏ, quyền càng cao).
 *
 * Level 1  GIAM_DOC              - Giám đốc
 * Level 2  PHO_GIAM_DOC          - Phó Giám đốc
 * Level 3  TRUONG_DON_VI         - Trưởng đơn vị / Trưởng khoa
 * Level 4  PHO_TRUONG_DON_VI     - Phó Trưởng đơn vị / Phó khoa
 * Level 5  NHAN_VIEN             - Nhân viên
 * Level 6  NGUOI_XEM_NOI_BO      - Người xem nội bộ (chỉ xem, toàn viện, không theo đơn vị)
 * Level 7  KHACH                 - Khách / người xem công khai (chỉ xem tài liệu công khai)
 *
 * QUY TẮC PHÂN QUYỀN (đơn giản, không phân nhánh phức tạp):
 * 1) Level 1-2 (Ban Giám đốc): xem TẤT CẢ tài liệu của TẤT CẢ đơn vị, upload/sửa/xóa mọi nơi.
 * 2) Level 3-4 (Trưởng/Phó đơn vị): toàn quyền (xem/upload/sửa/xóa) trong ĐÚNG đơn vị của mình,
 *    và chỉ được XEM tài liệu "toàn viện" (department = 'ALL') do BGD/Ban KHTH đăng.
 * 3) Level 5 (Nhân viên): được XEM + UPLOAD trong đơn vị của mình (không được sửa/xóa tài liệu
 *    người khác đăng), và chỉ XEM tài liệu "toàn viện".
 * 4) Level 6 (Người xem nội bộ): chỉ XEM tài liệu có visibility = 'noi_bo' hoặc 'cong_khai'
 *    (không phân biệt đơn vị, không được upload).
 * 5) Level 7 (Khách): chỉ XEM tài liệu có visibility = 'cong_khai'.
 *
 * -> Quyền truy cập 1 tài liệu được quyết định bởi 2 trường trên Document: `department` và `visibility`,
 *    kết hợp với `level` + `department` của user. Không cần bảng phân quyền phức tạp (ACL) riêng.
 */

const LEVELS = [
  { value: 1, code: 'GIAM_DOC', label: 'Giám đốc' },
  { value: 2, code: 'PHO_GIAM_DOC', label: 'Phó Giám đốc' },
  { value: 3, code: 'TRUONG_DON_VI', label: 'Trưởng đơn vị / Trưởng khoa' },
  { value: 4, code: 'PHO_TRUONG_DON_VI', label: 'Phó Trưởng đơn vị / Phó khoa' },
  { value: 5, code: 'NHAN_VIEN', label: 'Nhân viên' },
  { value: 6, code: 'NGUOI_XEM_NOI_BO', label: 'Người xem nội bộ' },
  { value: 7, code: 'KHACH', label: 'Khách / Người xem công khai' },
];

const VISIBILITY = {
  NOI_BO: 'noi_bo', // chỉ nhân viên trong viện (level 1-6) xem được, còn giới hạn theo đơn vị nếu department != ALL
  CONG_KHAI: 'cong_khai', // ai cũng xem được kể cả khách (level 7)
};

const ALL_DEPARTMENTS_CODE = 'ALL'; // tài liệu dùng chung toàn viện

function canUpload(level) {
  return level <= 5; // Level 1-5 được upload, 6-7 chỉ xem
}

function canManageDepartment(level) {
  return level <= 4; // Level 1-4 có quyền sửa/xóa tài liệu trong phạm vi mình quản lý
}

function isDirector(level) {
  return level <= 2; // Ban Giám đốc: toàn quyền, mọi đơn vị
}

/**
 * Kiểm tra user có được XEM tài liệu hay không.
 * @param {{level:number, department:string}} user
 * @param {{department:string, visibility:string}} doc
 */
function canView(user, doc) {
  // Khách (level 7): chỉ xem tài liệu công khai
  if (user.level === 7) return doc.visibility === VISIBILITY.CONG_KHAI;

  // Người xem nội bộ (level 6): xem mọi tài liệu nội bộ + công khai, không phân biệt đơn vị
  if (user.level === 6) return true;

  // Ban Giám đốc (level 1-2): xem tất cả
  if (isDirector(user.level)) return true;

  // Level 3-5: xem tài liệu toàn viện HOẶC tài liệu đúng đơn vị của mình
  if (doc.department === ALL_DEPARTMENTS_CODE) return true;
  return doc.department === user.department;
}

/**
 * Kiểm tra user có được SỬA/XÓA tài liệu hay không.
 * Quy tắc đơn giản: người upload luôn được sửa/xóa tài liệu của chính mình;
 * ngoài ra Trưởng/Phó đơn vị (level <=4) được sửa/xóa mọi tài liệu trong đơn vị mình quản lý;
 * Ban Giám đốc (level <=2) được sửa/xóa mọi tài liệu.
 */
function canManageDoc(user, doc) {
  if (String(doc.uploadedBy) === String(user._id || user.id)) return true;
  if (isDirector(user.level)) return true;
  if (canManageDepartment(user.level) && doc.department === user.department) return true;
  return false;
}

module.exports = {
  LEVELS,
  VISIBILITY,
  ALL_DEPARTMENTS_CODE,
  canUpload,
  canManageDepartment,
  isDirector,
  canView,
  canManageDoc,
};
