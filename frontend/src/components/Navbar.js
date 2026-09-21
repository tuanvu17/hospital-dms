import React from 'react';
import { useAuth } from '../context/AuthContext';

const LEVEL_LABELS = {
  1: 'Giám đốc',
  2: 'Phó Giám đốc',
  3: 'Trưởng đơn vị',
  4: 'Phó Trưởng đơn vị',
  5: 'Nhân viên',
  6: 'Người xem nội bộ',
  7: 'Khách',
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-title">Quản lý Tài liệu</span>
        <span className="navbar-subtitle">Viện Y học PK-KQ</span>
      </div>

      {user && (
        <div className="navbar-user">
          <div className="navbar-user-info">
            <strong>{user.fullName}</strong>
            <span>{user.position || LEVEL_LABELS[user.level]}</span>
          </div>
          <span className={`badge badge-level-${user.level}`}>{LEVEL_LABELS[user.level]}</span>
          <button className="btn-ghost" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
}
