import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Grid3X3,
} from 'lucide-react';

const LEVEL_LABELS = {
  1: 'Giám đốc',
  2: 'Phó Giám đốc',
  3: 'Trưởng đơn vị',
  4: 'Phó Trưởng đơn vị',
  5: 'Nhân viên',
  6: 'Người xem nội bộ',
  7: 'Khách',
};

export default function Navbar({ onOpenMatrix }) {
  const { user, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  // Đóng popup khi click ra bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const levelLabel =
    LEVEL_LABELS[user?.level] || 'Người dùng';

  const userInitial =
    user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="navbar">
      {/* =========================
          BRAND
          ========================= */}
      <div className="navbar-brand">
        <div className="navbar-logo">
          PK
        </div>

        <div className="navbar-brand-text">
          <div className="navbar-title">
            QUÂN CHỦNG PK-KQ
          </div>

          <div className="navbar-subtitle">
            VIỆN Y HỌC PHÒNG KHÔNG - KHÔNG QUÂN
          </div>
        </div>
      </div>

      {/* =========================
          CENTER
          ========================= */}
      <div className="navbar-center">
        <div className="navbar-page-title">
          Minh chứng điện tử
        </div>
      </div>

      {/* =========================
          RIGHT
          ========================= */}
      {user && (
        <div className="navbar-right">

          {/* Matrix */}
          {onOpenMatrix && (
            <button
              type="button"
              className="navbar-icon-button"
              onClick={onOpenMatrix}
              title="Ma trận phân quyền"
            >
              <Grid3X3 size={18} />
            </button>
          )}

          {/* Security */}
          <div className="navbar-security">
            <Shield size={15} />
            <span>BẢO MẬT NỘI BỘ</span>
          </div>

          {/* =========================
              USER
              ========================= */}
          <div
            className="navbar-user-wrapper"
            ref={userMenuRef}
          >
            <button
              type="button"
              className="navbar-user-button"
              onClick={() =>
                setUserMenuOpen((prev) => !prev)
              }
            >
              {/* Avatar */}
              <div className="navbar-user-avatar">
                {userInitial}
              </div>

              {/* User info */}
              <div className="navbar-user-info">
                <strong>
                  {user.fullName}
                </strong>

                <span>
                  {user.position || levelLabel}
                </span>
              </div>

              <ChevronDown
                size={16}
                className={`navbar-user-chevron ${
                  userMenuOpen ? 'open' : ''
                }`}
              />
            </button>

            {/* =========================
                USER DROPDOWN
                ========================= */}
            {userMenuOpen && (
              <div className="navbar-user-dropdown">

                {/* Header */}
                <div className="navbar-dropdown-header">

                  <div className="navbar-dropdown-user">
                    <div className="navbar-dropdown-avatar">
                      {userInitial}
                    </div>

                    <div>
                      <div className="navbar-dropdown-name">
                        {user.fullName}
                      </div>

                      <div className="navbar-dropdown-position">
                        {user.position || levelLabel}
                      </div>
                    </div>
                  </div>

                  <div className="navbar-dropdown-level">
                    <span
                      className={`badge badge-level-${user.level}`}
                    >
                      {levelLabel}
                    </span>
                  </div>

                  {user.departmentName && (
                    <div className="navbar-dropdown-department">
                      Đơn vị: {user.departmentName}
                    </div>
                  )}

                  {user.department && !user.departmentName && (
                    <div className="navbar-dropdown-department">
                      Đơn vị: {user.department}
                    </div>
                  )}
                </div>

                <div className="navbar-dropdown-divider" />

                {/* Profile */}
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                  }}
                >
                  <User size={17} />
                  <span>
                    Thông tin cá nhân
                  </span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                  }}
                >
                  <Settings size={17} />
                  <span>
                    Cài đặt
                  </span>
                </button>

                {/* Matrix */}
                {onOpenMatrix && (
                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenMatrix();
                    }}
                  >
                    <Grid3X3 size={17} />
                    <span> 
                      Ma trận phân quyền
                    </span> 
                  </button>
                )}

                <div className="navbar-dropdown-divider" />

                {/* Logout */}
                <button
                  type="button"
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  <span>
                    Đăng xuất
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}