import React from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FILE_ICONS = {
  pdf: '📄',
  word: '📝',
  excel: '📊',
  powerpoint: '📽️',
  image: '🖼️',
  other: '📁',
};

function iconFor(mime) {
  if (mime.includes('pdf')) return FILE_ICONS.pdf;
  if (mime.includes('word')) return FILE_ICONS.word;
  if (mime.includes('sheet') || mime.includes('excel')) return FILE_ICONS.excel;
  if (mime.includes('presentation') || mime.includes('powerpoint')) return FILE_ICONS.powerpoint;
  if (mime.includes('image')) return FILE_ICONS.image;
  return FILE_ICONS.other;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('vi-VN');
}

export default function DocumentList({ documents, meta, onChanged }) {
  const { user } = useAuth();

  function departmentName(code) {
    if (code === meta.allDepartmentsCode) return 'Toàn viện';
    const d = meta.departments.find((x) => x.code === code);
    return d ? d.name : code;
  }

  function canManage(doc) {
    if (doc.uploadedBy === user.id) return true;
    if (user.level <= 2) return true;
    if (user.level <= 4 && doc.department === user.department) return true;
    return false;
  }

  async function handleDownload(doc) {
    const res = await api.get(`/documents/${doc._id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Xóa tài liệu "${doc.title}"?`)) return;
    await api.delete(`/documents/${doc._id}`);
    onChanged();
  }

  if (documents.length === 0) {
    return <div className="empty-state">Chưa có tài liệu nào phù hợp.</div>;
  }

  return (
    <div className="doc-grid">
      {documents.map((doc) => (
        <div className="doc-card" key={doc._id}>
          <div className="doc-icon">{iconFor(doc.fileType)}</div>
          <div className="doc-body">
            <h3 title={doc.title}>{doc.title}</h3>
            {doc.description && <p className="doc-desc">{doc.description}</p>}
            <div className="doc-meta">
              <span className="tag">{departmentName(doc.department)}</span>
              <span className={`tag tag-${doc.visibility}`}>
                {doc.visibility === 'cong_khai' ? 'Công khai' : 'Nội bộ'}
              </span>
              <span className="tag-size">{formatSize(doc.fileSize)}</span>
            </div>
            <div className="doc-footer">
              <span>
                {doc.uploadedByName} · {formatDate(doc.createdAt)}
              </span>
              <div className="doc-actions">
                <button className="btn-small" onClick={() => handleDownload(doc)}>
                  Tải xuống
                </button>
                {canManage(doc) && (
                  <button className="btn-small btn-danger" onClick={() => handleDelete(doc)}>
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
