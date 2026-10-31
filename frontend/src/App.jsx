import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import { studentApi } from './services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [stats, setStats] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadStats = useCallback(async () => {
    try {
      const res = await studentApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getAll({ search, gender, page, limit: 10 });
      if (res.success) {
        setStudents(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, gender, page]);

  useEffect(() => {
    loadStudents();
    loadStats();
  }, [loadStudents, loadStats]);

  // Submit create or update
  const handleSubmitForm = async (formData) => {
    if (editingStudent) {
      // UPDATE
      await studentApi.update(editingStudent.student_id, formData);
      showToast(`อัปเดตข้อมูลนักศึกษารหัส ${editingStudent.student_id} สำเร็จ!`, 'success');
      setEditingStudent(null);
    } else {
      // CREATE
      await studentApi.create(formData);
      showToast(`เพิ่มนักศึกษาใหม่รหัส ${formData.student_id} เรียบร้อยแล้ว!`, 'success');
    }
    loadStudents();
    loadStats();
  };

  // Delete student
  const handleDeleteStudent = async (student) => {
    const confirmDelete = window.confirm(
      `คุณต้องการลบข้อมูลของ "${student.first_name} ${student.last_name}" (รหัส: ${student.student_id}) ใช่หรือไม่?`
    );
    if (!confirmDelete) return;

    try {
      await studentApi.delete(student.student_id);
      showToast(`ลบข้อมูลนักศึกษารหัส ${student.student_id} สำเร็จ`, 'success');
      if (editingStudent?.student_id === student.student_id) {
        setEditingStudent(null);
      }
      loadStudents();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <Navbar />

      <main className="container pb-5">
        {/* Global Toast Message */}
        {toast && (
          <div className={`toast-msg ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Stats Summary */}
        <StatsCards stats={stats} />

        {/* Main Grid: Form (Left) & Table (Right) */}
        <div className="main-layout">
          <StudentForm
            editingStudent={editingStudent}
            onSubmit={handleSubmitForm}
            onCancel={() => setEditingStudent(null)}
            isLoading={isLoading}
          />

          <StudentTable
            students={students}
            total={total}
            page={page}
            totalPages={totalPages}
            search={search}
            gender={gender}
            isLoading={isLoading}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onGenderChange={(val) => {
              setGender(val);
              setPage(1);
            }}
            onPageChange={(newPage) => setPage(newPage)}
            onRefresh={() => {
              loadStudents();
              loadStats();
            }}
            onEdit={(student) => {
              setEditingStudent(student);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDelete={handleDeleteStudent}
          />
        </div>
      </main>
    </div>
  );
}
