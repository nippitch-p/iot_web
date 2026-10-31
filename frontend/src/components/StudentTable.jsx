import React from 'react';
import { Search, RotateCw, Edit3, Trash2, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StudentTable({
  students,
  total,
  page,
  totalPages,
  search,
  gender,
  isLoading,
  onSearchChange,
  onGenderChange,
  onPageChange,
  onRefresh,
  onEdit,
  onDelete,
}) {
  const getGenderBadge = (g) => {
    if (g === 'ชาย') return <span className="badge badge-male">ชาย</span>;
    if (g === 'หญิง') return <span className="badge badge-female">หญิง</span>;
    return <span className="badge badge-other">{g}</span>;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <User size={20} color="#2563eb" /> รายชื่อนักศึกษา ({total} คน)
        </h2>
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={isLoading}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          title="รีเฟรชข้อมูล"
        >
          <RotateCw size={14} className={isLoading ? 'spin-anim' : ''} /> รีเฟรช
        </button>
      </div>

      {/* Toolbar: ค้นหา และ กรองเพศ */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="ค้นหา (รหัสนักศึกษา, ชื่อ, หรือนามสกุล)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '150px' }}>
          <select
            className="form-control"
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
          >
            <option value="">เพศทั้งหมด</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
            <option value="LGBTQ+">LGBTQ+</option>
            <option value="ไม่ระบุ">ไม่ระบุ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>รหัสประจำตัว</th>
              <th>ชื่อ - นามสกุล</th>
              <th>วันเกิด</th>
              <th>เพศ</th>
              <th style={{ textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                  ไม่พบข้อมูลนักศึกษาที่ค้นหา
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.student_id}>
                  <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                    {student.student_id}
                  </td>
                  <td>
                    {student.first_name} {student.last_name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)' }}>
                      <Calendar size={14} />
                      {student.birth_date}
                    </div>
                  </td>
                  <td>{getGenderBadge(student.gender)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-edit-outline"
                        onClick={() => onEdit(student)}
                        title="แก้ไขข้อมูล"
                      >
                        <Edit3 size={14} /> แก้ไข
                      </button>
                      <button
                        className="btn btn-danger-outline"
                        onClick={() => onDelete(student)}
                        title="ลบข้อมูล"
                      >
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div>
            หน้า {page} จาก {totalPages} (ทั้งหมด {total} รายการ)
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <ChevronLeft size={16} /> ก่อนหน้า
            </button>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              ถัดไป <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
