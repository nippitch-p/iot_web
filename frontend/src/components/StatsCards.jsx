import React from 'react';
import { Users, User, HeartHandshake } from 'lucide-react';

export default function StatsCards({ stats }) {
  const total = stats?.totalStudents || 0;
  const male = stats?.byGender?.['ชาย'] || 0;
  const female = stats?.byGender?.['หญิง'] || 0;
  const other = (stats?.byGender?.['LGBTQ+'] || 0) + (stats?.byGender?.['ไม่ระบุ'] || 0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <Users size={24} />
        </div>
        <div>
          <div className="stat-val">{total}</div>
          <div className="stat-lbl">นักศึกษาทั้งหมด (คน)</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
          <User size={24} />
        </div>
        <div>
          <div className="stat-val">{male}</div>
          <div className="stat-lbl">เพศชาย (คน)</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
          <User size={24} />
        </div>
        <div>
          <div className="stat-val">{female}</div>
          <div className="stat-lbl">เพศหญิง (คน)</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
          <HeartHandshake size={24} />
        </div>
        <div>
          <div className="stat-val">{other}</div>
          <div className="stat-lbl">LGBTQ+ / อื่นๆ (คน)</div>
        </div>
      </div>
    </div>
  );
}
