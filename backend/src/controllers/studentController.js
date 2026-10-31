const { query } = require('../config/db');


exports.createStudent = async (req, res) => {
  try {
    const { student_id, first_name, last_name, birth_date, gender } = req.body;

    // ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
    if (!student_id || !first_name || !last_name || !birth_date || !gender) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน: รหัสประจำตัว, ชื่อ, นามสกุล, วันเกิด, เพศ',
      });
    }

    // ตรวจสอบรหัสนักศึกษาซ้ำ
    const checkDuplicate = await query(
      'SELECT id FROM students WHERE student_id = $1;',
      [student_id.trim()]
    );

    if (checkDuplicate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `รหัสนักศึกษา '${student_id}' มีอยู่ในระบบแล้ว`,
      });
    }

    const insertSql = `
      INSERT INTO students (student_id, first_name, last_name, birth_date, gender)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      student_id.trim(),
      first_name.trim(),
      last_name.trim(),
      birth_date,
      gender.trim(),
    ];

    const result = await query(insertSql, values);
    const newStudent = result.rows[0];

    // จัดการแปลง birth_date เป็น string รูปแบบ YYYY-MM-DD
    if (newStudent.birth_date instanceof Date) {
      newStudent.birth_date = newStudent.birth_date.toISOString().split('T')[0];
    }

    return res.status(201).json({
      success: true,
      message: 'สร้างข้อมูลนักศึกษาสำเร็จ',
      data: newStudent,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างข้อมูลนักศึกษา',
      error: error.message,
    });
  }
};

/**
 * 2. READ ALL - ดึงรายชื่อนักศึกษาทั้งหมด พร้อมค้นหาและแบ่งหน้า
 * GET /api/v1/students
 */
exports.getAllStudents = async (req, res) => {
  try {
    const { search, gender } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // กรองค้นหาตามชื่อ นามสกุล หรือรหัสนักศึกษา (ILIKE / LIKE)
    if (search && search.trim() !== '') {
      conditions.push(
        `(student_id ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // กรองตามเพศ
    if (gender && gender.trim() !== '') {
      conditions.push(`gender = $${paramIndex}`);
      params.push(gender.trim());
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // นับจำนวนรายการทั้งหมด
    const countSql = `SELECT COUNT(*) as total FROM students ${whereClause};`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // ดึงข้อมูลตามเงื่อนไข
    const dataSql = `
      SELECT * FROM students 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const dataResult = await query(dataSql, [...params, limit, offset]);

    const formattedData = dataResult.rows.map((s) => ({
      ...s,
      birth_date: s.birth_date instanceof Date ? s.birth_date.toISOString().split('T')[0] : s.birth_date,
    }));

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา',
      error: error.message,
    });
  }
};

/**
 * 3. READ ONE - ดึงข้อมูลนักศึกษารายคนตามรหัสนักศึกษา
 * GET /api/v1/students/:student_id
 */
exports.getStudentById = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await query('SELECT * FROM students WHERE student_id = $1;', [student_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบข้อมูลนักศึกษารหัส '${student_id}'`,
      });
    }

    const student = result.rows[0];
    if (student.birth_date instanceof Date) {
      student.birth_date = student.birth_date.toISOString().split('T')[0];
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student by id:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา',
      error: error.message,
    });
  }
};

/**
 * 4. UPDATE - แก้ไขข้อมูลนักศึกษา
 * PUT /api/v1/students/:student_id
 */
exports.updateStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { first_name, last_name, birth_date, gender, new_student_id } = req.body;

    // ตรวจสอบว่ามีนักศึกษาคนนี้หรือไม่
    const checkExist = await query('SELECT * FROM students WHERE student_id = $1;', [student_id]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบข้อมูลนักศึกษารหัส '${student_id}'`,
      });
    }

    const targetStudentId = (new_student_id || student_id).trim();

    // หากมีการเปลี่ยนรหัสนักศึกษา ต้องตรวจสอบไม่ให้ซ้ำกับคนอื่น
    if (new_student_id && new_student_id.trim() !== student_id) {
      const checkDuplicate = await query(
        'SELECT id FROM students WHERE student_id = $1 AND student_id != $2;',
        [targetStudentId, student_id]
      );
      if (checkDuplicate.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `รหัสนักศึกษา '${targetStudentId}' มีอยู่ในระบบแล้ว`,
        });
      }
    }

    const updateSql = `
      UPDATE students 
      SET 
        student_id = COALESCE($1, student_id),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        birth_date = COALESCE($4, birth_date),
        gender = COALESCE($5, gender),
        updated_at = CURRENT_TIMESTAMP
      WHERE student_id = $6
      RETURNING *;
    `;

    const values = [
      targetStudentId,
      first_name ? first_name.trim() : null,
      last_name ? last_name.trim() : null,
      birth_date || null,
      gender ? gender.trim() : null,
      student_id,
    ];

    const result = await query(updateSql, values);
    const updated = result.rows[0];

    if (updated.birth_date instanceof Date) {
      updated.birth_date = updated.birth_date.toISOString().split('T')[0];
    }

    return res.status(200).json({
      success: true,
      message: 'อัปเดตข้อมูลนักศึกษาสำเร็จ',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลนักศึกษา',
      error: error.message,
    });
  }
};

/**
 * 5. DELETE - ลบข้อมูลนักศึกษา
 * DELETE /api/v1/students/:student_id
 */
exports.deleteStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    const checkExist = await query('SELECT * FROM students WHERE student_id = $1;', [student_id]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบข้อมูลนักศึกษารหัส '${student_id}'`,
      });
    }

    await query('DELETE FROM students WHERE student_id = $1;', [student_id]);

    return res.status(200).json({
      success: true,
      message: `ลบข้อมูลนักศึกษารหัส '${student_id}' สำเร็จ`,
      student_id,
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข้อมูลนักศึกษา',
      error: error.message,
    });
  }
};

/**
 * 6. STATS - ข้อมูลสรุปสถิตินักศึกษา
 * GET /api/v1/students/stats/summary
 */
exports.getStats = async (req, res) => {
  try {
    const totalResult = await query('SELECT COUNT(*) as total FROM students;');
    const genderResult = await query(`
      SELECT gender, COUNT(*) as count 
      FROM students 
      GROUP BY gender;
    `);

    const total = parseInt(totalResult.rows[0].total, 10);
    const genderDistribution = {};
    genderResult.rows.forEach((r) => {
      genderDistribution[r.gender] = parseInt(r.count, 10);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: total,
        byGender: genderDistribution,
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ',
      error: error.message,
    });
  }
};
