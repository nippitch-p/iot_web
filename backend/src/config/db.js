const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

let dbInstance = null;
let dbType = 'unknown';

async function initDatabase() {
  const mode = process.env.DB_MODE || 'auto';

  if (mode !== 'pglite_only') {
    try {
      const poolConfig = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2000 }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME || 'student_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            connectionTimeoutMillis: 2000,
          };

      const testPool = new Pool(poolConfig);
      const client = await testPool.connect();
      client.release();

      console.log('✅ [Database] Connected successfully to PostgreSQL Server!');
      dbInstance = testPool;
      dbType = 'postgres';
    } catch (err) {
      console.warn('⚠️ [Database] Could not connect to PostgreSQL Server (' + err.message + ')');
    }
  }

  if (!dbInstance) {
    try {
      console.log('📦 [Database] Initializing PGlite (Embedded PostgreSQL Engine)...');
      const { PGlite } = require('@electric-sql/pglite');
      const dataDir = path.join(__dirname, '../../pgdata');
      const pglite = new PGlite(dataDir);
      dbInstance = pglite;
      dbType = 'pglite';
      console.log(`✅ [Database] Connected to Embedded PostgreSQL at: ${dataDir}`);
    } catch (err) {
      console.error('❌ [Database] Failed to initialize PGlite:', err);
      throw err;
    }
  }

  await createTablesAndSeed();
  return dbInstance;
}

async function query(text, params = []) {
  if (!dbInstance) {
    throw new Error('Database is not initialized. Please call initDatabase() first.');
  }

  if (dbType === 'postgres') {
    const result = await dbInstance.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
    };
  } else {
    // PGlite query
    const result = await dbInstance.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.affectedRows !== undefined ? result.affectedRows : result.rows.length,
    };
  }
}

async function createTablesAndSeed() {
  // สร้างตาราง students
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      birth_date DATE NOT NULL,
      gender VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await query(createTableQuery);

  // ตรวจสอบว่ามีข้อมูลแล้วหรือยัง
  const countResult = await query('SELECT COUNT(*) as total FROM students;');
  const total = parseInt(countResult.rows[0].total, 10);

  if (total === 0) {
    console.log(' [Database] Seeding initial sample students data...');
    const seedQuery = `
      INSERT INTO students (student_id, first_name, last_name, birth_date, gender)
      VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15),
        ($16, $17, $18, $19, $20),
        ($21, $22, $23, $24, $25);
    `;
    const seedValues = [
      '65010001', 'สมชาย', 'ใจดี', '2004-05-15', 'ชาย',
      '65010002', 'สมหญิง', 'รักเรียน', '2004-08-20', 'หญิง',
      '65010003', 'กิตติพงษ์', 'มั่งมี', '2003-12-01', 'ชาย',
      '65010004', 'ปิยวรรณ', 'งามตา', '2004-02-14', 'หญิง',
      '65010005', 'ธนากร', 'สดใส', '2004-11-30', 'LGBTQ+',
    ];
    await query(seedQuery, seedValues);
    console.log(' [Database] Seeded 5 sample students successfully!');
  }
}

module.exports = {
  initDatabase,
  query,
  getDbType: () => dbType,
};
