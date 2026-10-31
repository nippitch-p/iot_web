const API_BASE = '/api/v1/students';

export const studentApi = {
  // ดึงรายชื่อนักศึกษาทั้งหมด พร้อมค้นหาและแบ่งหน้า
  async getAll({ search = '', gender = '', page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (gender) params.append('gender', gender);
    params.append('page', page);
    params.append('limit', limit);

    const res = await fetch(`${API_BASE}?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ไม่สามารถดึงข้อมูลนักศึกษาได้');
    return data;
  },

  // ดึงข้อมูลนักศึกษารายคน
  async getById(studentId) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(studentId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ไม่พบข้อมูลนักศึกษา');
    return data;
  },

  // สร้างนักศึกษาใหม่ (CREATE)
  async create(studentData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ไม่สามารถสร้างข้อมูลนักศึกษาได้');
    return data;
  },

  // แก้ไขข้อมูลนักศึกษา (UPDATE)
  async update(studentId, studentData) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ไม่สามารถอัปเดตข้อมูลได้');
    return data;
  },

  // ลบข้อมูลนักศึกษา (DELETE)
  async delete(studentId) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(studentId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ไม่สามารถลบข้อมูลนักศึกษาได้');
    return data;
  },

  // ดึงสถิตินักศึกษา
  async getStats() {
    const res = await fetch(`${API_BASE}/stats/summary`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ไม่สามารถดึงสถิติได้');
    return data;
  },
};
