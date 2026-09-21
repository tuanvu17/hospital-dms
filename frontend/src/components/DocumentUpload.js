import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function DocumentUpload({ meta, onUploaded, onClose }) {
  const { user } = useAuth();
  const isDirector = user.level <= 2;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(isDirector ? meta.allDepartmentsCode : user.department);
  const [visibility, setVisibility] = useState(meta.visibility.NOI_BO);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('department', department);
    formData.append('visibility', visibility);
    formData.append('file', file);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  }

  // Level 3-5 (không phải BGĐ) chỉ được chọn đơn vị của chính mình hoặc "Toàn viện"
  const departmentOptions = isDirector
    ? meta.departments
    : meta.departments.filter((d) => d.code === user.department);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Tải lên tài liệu</h2>
        {error && <div className="alert-error">{error}</div>}

        <label>Tiêu đề *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Mô tả</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

        <label>Đơn vị *</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          {isDirector && <option value={meta.allDepartmentsCode}>Toàn viện (mọi đơn vị)</option>}
          {departmentOptions.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>

        <label>Phạm vi hiển thị *</label>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value={meta.visibility.NOI_BO}>Nội bộ (chỉ nhân viên trong viện)</option>
          <option value={meta.visibility.CONG_KHAI}>Công khai (ai cũng xem được)</option>
        </select>

        <label>File *</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <p className="hint">Hỗ trợ: PDF, Word, Excel, PowerPoint, hình ảnh (tối đa 25MB)</p>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        </div>
      </form>
    </div>
  );
}
