import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import DocumentList from "../components/DocumentList";
import DocumentUpload from "../components/DocumentUpload";

export default function Dashboard() {
  const { user } = useAuth();
  const [meta, setMeta] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMeta = useCallback(async () => {
    const { data } = await api.get("/meta");
    setMeta(data);
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (search) params.q = search;
    if (deptFilter) params.department = deptFilter;
    const { data } = await api.get("/documents", { params });
    setDocuments(data);
    setLoading(false);
  }, [search, deptFilter]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const canUpload = user.level <= 5;

  return (
    <div className="page">
      <div className="page-container">
        <Navbar />
        <main className="content">
          <div className="toolbar">
            <input
              className="search-input"
              placeholder="Tìm kiếm tài liệu theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {meta && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">Tất cả đơn vị (trong phạm vi được xem)</option>
                {meta.departments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {canUpload && (
              <button onClick={() => setShowUpload(true)}>
                + Tải lên tài liệu
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty-state">Đang tải...</div>
          ) : (
            meta && (
              <DocumentList
                documents={documents}
                meta={meta}
                onChanged={loadDocuments}
              />
            )
          )}
        </main>
      </div>

      {showUpload && meta && (
        <DocumentUpload
          meta={meta}
          onUploaded={loadDocuments}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
