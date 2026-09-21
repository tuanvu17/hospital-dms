/**
 * Danh sách đơn vị/phòng ban theo sơ đồ tổ chức Viện Y học PK-KQ.
 * "code" dùng làm giá trị lưu trong DB (không dấu, không khoảng trắng) để tránh lỗi encoding/so khớp.
 * "parent" chỉ mang tính hiển thị (breadcrumb cây), KHÔNG dùng để tính quyền
 *  (mô hình phân quyền chọn theo cách đơn giản: quyền theo LEVEL + đơn vị trực tiếp của user).
 */

const DEPARTMENTS = [
  { code: 'BGD', name: 'Ban Giám Đốc', parent: null },

  { code: 'TT_YHHK', name: 'Trung tâm Y học Hàng không', parent: 'BGD' },
  { code: 'KHOA_KHAM_TUYEN_PHI_CONG', name: 'Khoa Khám tuyển phi công', parent: 'TT_YHHK' },

  { code: 'KHOI_KCB', name: 'Khối Khám chữa bệnh', parent: 'BGD' },

  { code: 'KHOI_LAM_SANG', name: 'Khối Lâm sàng', parent: 'KHOI_KCB' },
  { code: 'KHOA_A1', name: 'Khoa A1', parent: 'KHOI_LAM_SANG' },
  { code: 'KHOA_A2', name: 'Khoa A2', parent: 'KHOI_LAM_SANG' },
  { code: 'KHOA_A3', name: 'Khoa A3', parent: 'KHOI_LAM_SANG' },
  { code: 'KHOA_B1', name: 'Khoa B1', parent: 'KHOI_LAM_SANG' },
  { code: 'KHOA_B2', name: 'Khoa B2', parent: 'KHOI_LAM_SANG' },
  { code: 'KHOA_B3', name: 'Khoa B3', parent: 'KHOI_LAM_SANG' },
  { code: 'KHOA_B5', name: 'Khoa B5', parent: 'KHOI_LAM_SANG' },

  { code: 'KHOI_CLS', name: 'Khối Cận lâm sàng', parent: 'KHOI_KCB' },
  { code: 'XN', name: 'Xét nghiệm (XN)', parent: 'KHOI_CLS' },
  { code: 'CDHA', name: 'Chẩn đoán hình ảnh (CĐHA)', parent: 'KHOI_CLS' },

  { code: 'KHOI_BAO_DAM', name: 'Khối Bảo đảm', parent: 'KHOI_KCB' },
  { code: 'TO_DUOC', name: 'Tổ Dược', parent: 'KHOI_BAO_DAM' },
  { code: 'TO_TRANG_BI', name: 'Tổ Trang bị', parent: 'KHOI_BAO_DAM' },

  { code: 'KHOA_CO_QUAN', name: 'Khoa Cơ quan', parent: 'BGD' },

  { code: 'BAN_KHTH', name: 'Ban Kế hoạch Tổng hợp', parent: 'BGD' },
  { code: 'TO_CNTT', name: 'Tổ CNTT', parent: 'BAN_KHTH' },
  { code: 'TO_CTXH', name: 'Tổ Công tác Xã hội', parent: 'BAN_KHTH' },
  { code: 'TO_HANH_CHINH', name: 'Tổ Hành chính', parent: 'BAN_KHTH' },
  { code: 'TO_QUAN_LUC', name: 'Tổ Quân lực', parent: 'BAN_KHTH' },

  { code: 'BAN_CHINH_TRI', name: 'Ban Chính trị', parent: 'BGD' },
  { code: 'BAN_TAI_CHINH', name: 'Ban Tài chính', parent: 'BGD' },
  { code: 'BAN_DIEU_DUONG', name: 'Ban Điều dưỡng', parent: 'BGD' },
  { code: 'BAN_HAU_CAN', name: 'Ban Hậu cần', parent: 'BGD' },
];

const DEPARTMENT_CODES = DEPARTMENTS.map((d) => d.code);

module.exports = { DEPARTMENTS, DEPARTMENT_CODES };
