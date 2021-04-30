const mysql = require('mysql');
const dbConfig = require('./config');

var pool = mysql.createPool(dbConfig);

// 카테고리 리스트 조회
exports.selectCategoryList = function selectCategoryList() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          * 
        FROM
          category
        `;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          // query 결과 반환
          resolve(rows);
        });
      }
      // connection을 pool에 반환
      connection.release();
    });
  });
};

// 업로드 되는 총 문항 수 조회
exports.selectCountQuestionList = function selectCountQuestionList() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          count(*) AS "count"
        FROM
          question
        WHERE
          upload_check = true
        `;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
};

// pagination에 해당 범위 question 조회
exports.selectPagedQuestionList = function selectPagedQuestionList(skipSize, contentSize) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          question
        WHERE
          upload_check = true
        LIMIT
          ?,
          ?
        `;
        connection.query(sql, [skipSize, contentSize], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 카테고리 & (문항 명 or 키워드 명) 문항 검색 조회
exports.selectSearchQuestion = function selectSearchQuestion(category, searchWord, skipSize, contentSize) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql;
        if ((category != 'select') && (searchWord != '')) {
          sql = `
          SELECT
            DISTINCT q.question_name, q.question_id, q.image
          FROM
            question AS q
            JOIN category AS c
              ON q.category_id = c.category_id
            JOIN keyword AS k
              ON q.question_id = k.question_id
          WHERE
            c.category_name = "${category}"
          AND
            q.upload_check = true
          AND
            (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")
          `;
        } else if (category != 'select') {
          sql = `
          SELECT
            *
          FROM
            question AS q
            JOIN category AS c
              ON q.category_id = c.category_id
          WHERE
            c.category_name = "${category}"
          AND
            q.upload_check = true
          `;
        } else if (searchWord != '') {
          sql = `
          SELECT
            DISTINCT q.question_name, q.question_id, q.image
          FROM
            question AS q
            JOIN keyword AS k
              ON q.question_id = k.question_id
          WHERE
            (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")
          AND
            q.upload_check = true
          `;
        } else {
          sql = `
          SELECT
            *
          FROM
            question
          WHERE
            upload_check = true
          `;
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

// 카테고리 & (문항 명 or 키워드 명) 문항 검색 결과 수 조회
exports.selectCountSearchQuestion = function selectCountSearchQuestion(category, searchWord) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql;
        if ((category != 'select') && (searchWord != '')) {
          sql = `
          SELECT 
            count(DISTINCT q.question_name) AS "count"
          FROM 
            question AS q
            JOIN category AS c
              ON q.category_id = c.category_id
            JOIN keyword AS k
              ON q.question_id = k.question_id
          WHERE 
            c.category_name = "${category}"
          AND
            q.upload_check = true
          AND
            (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")
          `;
        } else if (category != 'select') {
          sql = `
          SELECT
            count(*) AS "count"
          FROM
            question AS q
            JOIN category AS c
              ON q.category_id = c.category_id
          WHERE
            c.category_name = "${category}"
          AND
            q.upload_check = true
          `;
        } else if (searchWord != '') {
          sql = `
          SELECT
            count(DISTINCT q.question_name) AS "count"
          FROM
            question AS q
            JOIN keyword AS k
              ON q.question_id = k.question_id
          WHERE
            (q.question_name LIKE "%${searchWord}%" OR k.keyword_name LIKE "%${searchWord}%")
          AND
            q.upload_check = true
          `;
        } else {
          sql = `
          SELECT
            count(*) AS "count"
          FROM
            question
          WHERE
            upload_check = true
          `;
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

// 선생님의 과제 리스트 조회
exports.selectTeacherAssignmentList = function selectTeacherAssignmentList(teacherID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          assignment
        WHERE
          teacher_id = ?
        `;
        connection.query(sql, [teacherID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// makequestion 최근 row 1개 조회
exports.selectLatestMakeQuestionID = function selectLatestMakeQuestionID() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          make_question
        ORDER BY
          make_question_id DESC
        LIMIT
          1
        `;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 새로운 makequestion 삽입
exports.insertNewMakeQuestion = function insertNewMakeQuestion(teacherID, newQuestion, madeDate) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        INSERT INTO make_question
                    (
                      teacher_id,
                      question_name,
                      description, 
                      answer,
                      image,
                      hint,
                      made_date,
                      upload_check
                    )
        VALUES      (
                      ?,
                      ?,
                      ?,
                      ?,
                      ?,
                      ?,
                      ?,
                      0
                    )
        `;
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

// 새로운 채점준거 삽입 (makequestion 생성 시 함께 mark 생성)
exports.insertNewMark = function insertNewMark(makeQuestionID, markText) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        INSERT INTO mark (
                            make_question_id,
                            mark_text
                          )
        VALUES            (
                            ?,
                            ?
                          )
        `;
        connection.query(sql, [makeQuestionID, markText], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 학생 제외(공통 or 선생님) 공지사항 조회
exports.selectTeacherNoticeList = function selectTeacherNoticeList() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          notice
        WHERE
          NOT notice_target = "학생"
        `;
        connection.query(sql, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 해당 공지사항 자세히 조회
exports.selectTeacherNoticeDetail = function selectTeacherNoticeDetail(noticeID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          * 
        FROM
          notice
        WHERE
          notice_id = ?
        `;
        connection.query(sql, [noticeID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    })
  })
}

// 선생님 정보 조회
exports.selectTeacherInfo = function selectTeacherInfo(email) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          teacher
        WHERE
          email = ?
        `;
        connection.query(sql, [email], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 새로운 선생님 정보 삽입
exports.insertNewTeacher = function insertNewTeacher(lastName, firstName, school, email, password) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        INSERT INTO teacher (
                              teacher_name,
                              school,
                              email,
                              password,
                              approve
                            )
        VALUES              (
                              ?,
                              ?,
                              ?,
                              ?,
                              0
                            )
        `;
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

// 해당 과제 정보 조회
exports.selectAssignmentInfo = function selectAssignmentInfo(assignmentID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          assignment
        WHERE
          assignment_id = ?
        `;
        connection.query(sql, [assignmentID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 해당 문제를 푼 학생들의 정보 조희
exports.selectAssignmentSolveList = function selectAssignmentSolveList(assignmentID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          assignment_question_rel as rel
          JOIN solve as s
            ON rel.as_qurel_id = s.as_qurel_id
          JOIN assignment as a
            ON rel.assignment_id = a.assignment_id
          JOIN question as q
            ON rel.question_id = q.question_id
        WHERE q.upload_check = 1
        AND rel.assignment_id = ?;
        `;
        connection.query(sql, [assignmentID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 해당 과제의 문항들 조회
exports.selectAssignmentQuestionList = function selectAssignmentQuestionList(assignmentID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          DISTINCT rel.as_qurel_id, q.question_name
        FROM
          assignment_question_rel as rel
          JOIN solve as s
            ON rel.as_qurel_id = s.as_qurel_id
          JOIN assignment as a
            ON rel.assignment_id = a.assignment_id
          JOIN question as q
            ON rel.question_id = q.question_id
        WHERE q.upload_check = 1
        AND rel.assignment_id = ?;
        `;
        connection.query(sql, [assignmentID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// 과제 번호 조회
exports.selectAssignmentID = function selectAssignmentID(assignmentID) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          assignment
        WHERE
          assignment_id = ?
        `;
        connection.query(sql, [assignmentID], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.selectQuestionInfo = function selectQuestionInfo(questionIDList) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        SELECT
          *
        FROM
          question
        WHERE
          question_id IN (?)
        `;
        connection.query(sql, [questionIDList], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

exports.insertNewAssignment = function insertNewAssignment(newAssignment) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (!err) {
        var sql = `
        INSERT INTO assignment (
                              assignment_id,
                              teacher_id,
                              assignment_title,
                              type,
                              start_date,
                              end_date,
                              made_date,
                              grade,
                              school_class
                            )
        VALUES              (
                              ?,
                              ?,
                              ?,
                              ?,
                              ?,
                              ?,
                              ?,
                              ?,
                              ?
                            )
        `;
        connection.query(sql, [
          newAssignment.code_num,
          newAssignment.teacher_id,
          newAssignment.question_title,
          newAssignment.evaluation_type,
          newAssignment.start_date,
          newAssignment.end_date,
          newAssignment.made_date,
          newAssignment.grade,
          newAssignment.class,
        ], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
      connection.release();
    });
  });
}

// exports.insertNewAssignmentQuestionRel = function insertNewAssignmentQuestionRel(assignmentID, questionID) {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (!err) {
//         var sql = `
//         INSERT INTO assignment_question_rel (
//                               assignment_id,
//                               question_id,
//                             )
//         VALUES              (
//                               ?,
//                               ?
//                             )
//         `;
//         connection.query(sql, [assignmentID, questionID], (err, rows) => {
//           if (err) reject(err);
//           resolve(rows);
//         });
//       }
//       connection.release();
//     });
//   });
// }