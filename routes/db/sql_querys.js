const mysql = require('mysql');
const dbConfig = require('./config');

let pool = mysql.createPool(dbConfig);


exports.selectCategoryList = function selectCategoryList() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT * 
                     FROM category`;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
};

exports.selectCountQuestionList = function selectCountQuestionList() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT count(*) AS "count"
                     FROM question`;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
};

exports.selectUploadQuestionList =  function selectUploadQuestionList(skipSize, contentSize) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT *
                     FROM question
                     WHERE upload_check = true
                     LIMIT ?, ?`;
        connection.query(sql, [skipSize, contentSize], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectSearchQuestion = function selectSearchQuestion(category, searchWord, skipSize, contentSize) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        let sql;
        if ((category != 'select') && (searchWord != '')) {
          sql = `SELECT DISTINCT q.question_name, q.question_id, q.image
                 FROM question AS q
                 JOIN category AS c ON q.category_id = c.category_id
                 JOIN keyword AS k ON q.question_id = k.question_id
                 WHERE c.category_name = "${category}"
                 AND q.upload_check = true
                 AND (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")`;
        } else if (category != 'select') {
          sql = `SELECT *
                 FROM question AS q
                 JOIN category AS c ON q.category_id = c.category_id
                 WHERE c.category_name = "${category}"
                 AND q.upload_check = true`;
        } else if (searchWord != '') {
          sql = `SELECT DISTINCT q.question_name, q.question_id, q.image
                 FROM question AS q
                 JOIN keyword AS k ON q.question_id = k.question_id
                 WHERE (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")
                 AND q.upload_check = true`;
        } else {
          sql = `SELECT *
                 FROM question
                 WHERE upload_check = true`;
        }
        connection.query(sql + ' LIMIT ?, ?', [skipSize, contentSize], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectCountSearchQuestion = function selectCountSearchQuestion(category, searchWord) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        let sql;
        if ((category != 'select') && (searchWord != '')) {
          sql = `SELECT count(DISTINCT q.question_name) AS "count"
                 FROM question AS q
                 JOIN category AS c ON q.category_id = c.category_id
                 JOIN keyword AS k ON q.question_id = k.question_id
                 WHERE c.category_name = "${category}"
                 AND q.upload_check = true
                 AND (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")`;
        } else if (category != 'select') {
          sql = `SELECT count(*) AS "count"
                 FROM question AS q
                 JOIN category AS c ON q.category_id = c.category_id
                 WHERE c.category_name = "${category}"
                 AND q.upload_check = true`;
        } else if (searchWord != '') {
          sql = `SELECT count(DISTINCT q.question_name) AS "count"
                 FROM question AS q
                 JOIN keyword AS k ON q.question_id = k.question_id
                 WHERE (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")
                 AND q.upload_check = true`;
        } else {
          sql = `SELECT count(*) AS "count"
                 FROM question
                 WHERE upload_check = true`;
        }
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectTeacherAssignmentList = function selectTeacherAssignmentList(teacherID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT *
                     FROM assignment
                     WHERE teacher_id = ?`;
        connection.query(sql, [teacherID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectLatestMakeQuestionID = function selectLatestMakeQuestionID() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT *
                     FROM make_question
                     ORDER BY make_question_id
                     DESC LIMIT 1`;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.insertNewMakeQuestion = function insertNewMakeQuestion(teacherID, newQuestion , madeDate) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `INSERT INTO make_question (teacher_id, question_name, description, answer,
                                 image, hint, made_date, upload_check)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
        connection.query(sql, [
          teacherID,
          newQuestion.question_name,
          newQuestion.description,
          newQuestion.answer,
          newQuestion.image,
          newQuestion.hint,
          madeDate
        ], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.insertNewMark = function insertNewMark(makeQuestionID, markText) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `INSERT INTO mark (make_question_id, mark_text)
               VALUES (?, ?)`;
        connection.query(sql, [makeQuestionID, markText], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectTeacherNoticeList = function selectTeacherNoticeList() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT *
                     FROM notice
                     WHERE NOT notice_target = "학생"`;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectTeacherNoticeDetail = function selectTeacherNoticeDetail(noticeID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT * 
                     FROM notice
                     WHERE notice_id = ?`;
        connection.query(sql, [noticeID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    })
  })
}

exports.selectTeacherInfo = function selectTeacherInfo(email) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `SELECT *
                     FROM teacher
                     WHERE email = ?`;
        connection.query(sql, [email], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.insertNewTeacher = function insertNewTeacher(lastName, firstName, school, email, password) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        const sql = `INSERT INTO teacher (teacher_name, school, email, password, approve)
                     VALUES (?, ?, ?, ?, 0)`;
        connection.query(sql, [
          lastName + firstName,
          school,
          email,
          password
        ], (err, rows) => {
          if (err) reject(err)
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}