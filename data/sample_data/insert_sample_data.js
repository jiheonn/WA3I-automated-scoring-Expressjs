const fs = require('fs');
const mysql = require('mysql');
const csv = require('fast-csv');
const config = require('../../lib/config.json');

const data_list = {
  'wa3i_sample_data - teacher.csv':
    'INSERT INTO teacher (teacher_id, teacher_name, school, email, password, approve) VALUES ?',
  'wa3i_sample_data - assignment.csv':
    'INSERT INTO assignment (assignment_id, teacher_id, assignment_title, type, start_date, end_date, made_date, grade, school_class) VALUES ?',
  'wa3i_sample_data - makequestion.csv':
    'INSERT INTO make_question (make_question_id, teacher_id, question_name, description, answer, image, hint, made_date, upload_check) VALUES ?',
  'wa3i_sample_data - selfsolvedata.csv':
    'INSERT INTO self_solve_data (self_id, make_question_id, response, score, submit_date) VALUES ?',
  'wa3i_sample_data - mark.csv':
    'INSERT INTO mark (mark_id, make_question_id, mark_text) VALUES ?',
  'wa3i_sample_data - category.csv':
    'INSERT INTO category (category_id, category_name) VALUES ?',
  'wa3i_sample_data - question.csv':
    'INSERT INTO question (question_id, category_id, question_name, descrption, answer, image, hint, made_date, ques_concept, ml_model_check, upload_check) VALUES ?',
  'wa3i_sample_data - keyword.csv':
    'INSERT INTO keyword (keyword_id, question_id, keyword_name) VALUES ?',
  'wa3i_sample_data - studysolvedata.csv':
    'INSERT INTO study_solve_data (study_id, question_id, school, gender, response, sentence_score, answer_score, submit_date) VALUES ?',
  'wa3i_sample_data - assignmentquestionrel.csv':
    'INSERT INTO assignment_question_rel (as_qurel_id, assignment_id, question_id) VALUES ?',
  'wa3i_sample_data - solve.csv':
    'INSERT INTO solve (solve_id, as_qurel_id, student_id, submit_date, response, sentence_score, answer_score, student_name) VALUES ?',
  'wa3i_sample_data - notice.csv':
    'INSERT INTO notice (notice_id, notice_target, notice_name, notice_content, made_date) VALUES ?',
};

function importCsvData2MySQL(filename, query) {
  const stream = fs.createReadStream(filename);
  const csvData = [];
  const csvStream = csv
    .parse()
    .on('data', function (data) {
      csvData.push(data);
    })
    .on('end', function () {
      // Remove Header ROW
      csvData.shift();

      // Create a connection to the database
      const connection = mysql.createConnection(config.db);

      // Open the MySQL connection
      connection.connect((error) => {
        if (error) {
          console.error(error);
        } else {
          connection.query('SET FOREIGN_KEY_CHECKS=0;');
          connection.query(query, [csvData], (error, response) => {
            console.log(error || response);
          });
          connection.query('SET FOREIGN_KEY_CHECKS=1;');
          connection.end();
        }
      });
    });

  stream.pipe(csvStream);
}

Object.keys(data_list).forEach((key) => {
  // Import CSV Data to MySQL database
  importCsvData2MySQL(key, data_list[key]);
});