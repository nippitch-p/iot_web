import React from 'react';
import { GraduationCap, Database, Server, Globe } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-content">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <div>ระบบจัดการข้อมูลนักศึกษา</div>
            <div style={{ fontSize: '0.8rem', fontWeight: '400', opacity: 0.85 }}>
              Student Management CRUD System
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge-tech">
            <Globe size={14} /> React
          </span>
          <span className="badge-tech">
            <Server size={14} /> Express.js
          </span>
          <span className="badge-tech">
            <Database size={14} /> PostgreSQL
          </span>
        </div>
      </div>
    </header>
  );
}
