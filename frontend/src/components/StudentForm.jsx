import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, X, Save } from 'lucide-react';

export default function StudentForm({ editingStudent, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        student_id: editingStudent.student_id || '',
        first_name: editingStudent.first_name || '',
        last_name: editingStudent.last_name || '',
        birth_date: editingStudent.birth_date || '',
        gender: editingStudent.gender || '',
      });
    } else {
      setFormData({
        student_id: '',
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
      });
    }
    setFormError('');
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.student_id.trim()) return setFormError('กรุณากรอกรหัสประจำตัว');
    if (!formData.first_name.trim()) return setFormError('กรุณากรอกชื่อ');
    if (!formData.last_name.trim()) return setFormError('กรุณากรอกนามสกุล');
    if (!formData.birth_date) return setFormError('กรุณาเลือกวันเกิด');
    if (!formData.gender) return setFormError('กรุณาเลือกเพศ');

    try {
      await onSubmit(formData);
      if (!editingStudent) {
        setFormData({
          student_id: '',
          first_name: '',
          last_name: '',
          birth_date: '',
          gender: '',
        });
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const isEdit = !!editingStudent;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          {isEdit ? (
            <>
              <UserCheck size={20} color="#f59e0b" /> แก้ไขข้อมูลนักศึกษา
            </>
          ) : (
            <>
              <UserPlus size={20} color="#2563eb" /> เพิ่มข้อมูลนักศึกษาใหม่
            </>
          )}
        </h2>
        {isEdit && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            <X size={14} /> ปิด
          </button>
        )}
      </div>

      {formError && (
        <div className="toast-msg toast-error" style={{ marginBottom: '1rem' }}>
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            1. รหัสประจำตัว <span className="required">*</span>
          </label>
          <input
            type="text"
            name="student_id"
            className="form-control"
            placeholder="เช่น 65010001"
            value={formData.student_id}
            onChange={handleChange}
            disabled={isEdit} // ปกติรหัสนักศึกษาจะไม่นิยมเปลี่ยน หรือถ้าแก้ไขสามารถใช้ new_student_id
            required
          />
          {isEdit && (
            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              * รหัสประจำตัวเป็น Primary Identifier
            </small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            2. ชื่อ <span className="required">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            placeholder="เช่น สมชาย"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            3. นามสกุล <span className="required">*</span>
          </label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            placeholder="เช่น ใจดี"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            4. วันเกิด <span className="required">*</span>
          </label>
          <input
            type="date"
            name="birth_date"
            className="form-control"
            value={formData.birth_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            5. เพศ <span className="required">*</span>
          </label>
          <select
            name="gender"
            className="form-control"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">-- เลือกเพศ --</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
            <option value="LGBTQ+">LGBTQ+</option>
            <option value="ไม่ระบุ">ไม่ระบุ</option>
          </select>
        </div>

        <div className="btn-group-row" style={{ marginTop: '1.25rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isLoading}
          >
            <Save size={16} />
            {isLoading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มนักศึกษา'}
          </button>
          {isEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
