const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');

/* GET teachers listing. */
router.get('/login', (req, res, next) => {
  const session = req.session;
  if (session.teacher_id) res.redirect('home');
  else res.render('teachers/login');
});

router.get('/signup', (req, res, next) => {
  res.render('teachers/signup');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('sid');

  res.redirect('login');
});

router.get('/home', (req, res) => {
  const session = req.session;
    
  res.render('teachers/home', {session: session});
});

router.get('/QR-code', (req, res) => {
  const session = req.session;

  db.query('SELECT * FROM category;', (err, row) => {
    if (err) throw err;
    db.query('SELECT * FROM question WHERE upload_check = true;', (err, results) => {
      if (err) throw err;
      res.render('teachers/QR_code', {
        session: session,
        category_data: row,
        question_list: results
      });
    });
  });
});

router.get('/QR-code-search', (req, res) => {
  const session = req.session;
  
  const option = req.query.option;
  const user_input = req.query.user_input;
  
  let sql;
  if ((option != 'select') && (user_input != '')) {
    sql = `SELECT * FROM question AS q \
            JOIN category AS c ON q.category_id = c.category_id \
            JOIN keyword AS k ON q.question_id = k.question_id \
            WHERE c.category_name = "${option}" \
            AND q.upload_check = true \
            AND (q.question_name LIKE "%${user_input}% OR k.keyword_name LIKE "%${user_input}%");"`;
  } else if (option != 'select') {
    sql = `SELECT * FROM question AS q \
            JOIN category AS c ON q.category_id = c.category_id \
            WHERE c.category_name = "${option}" \
            AND q.upload_check = true;`;
  } else if (user_input != '') {
    sql = `SELECT DISTINCT q.question_id, q.question_name, q.image FROM question AS q\
            JOIN keyword AS k ON q.question_id = k.question_id \
            WHERE (q.question_name LIKE "%${user_input}%" OR k.keyword_name LIKE "%${user_input}%") \
            AND q.upload_check = true;`;
  } else {
    sql = 'SELECT * FROM question WHERE upload_check = true;';
  }
  db.query('SELECT * FROM category;', (err, row) => {
    if (err) throw err;
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.render('teachers/QR_code', {
        session: session,
        category_data: row,
        question_list: results
      });
    });
  });
});

router.get('/notice', (req, res) => {
  const session = req.session;

  db.query(`SELECT * FROM notice WHERE NOT notice_target = "학생";`, (err, results) => {
    if (err) throw err;

    for (let notice_value of results) {
      notice_value.made_date = moment(notice_value.made_date).format('YYYY년 MM월 DD일');
    }
    res.render('teachers/notice', {session: session, data: results});
  });
});

router.get('/notice/:id', (req, res) => {
  const session = req.session;
  const notice_id = req.params.id;
  db.query(`SELECT * FROM notice WHERE notice_id = "${notice_id}";`, (err, results) => {
    if (err) throw err;

    let notice = results[0];
    notice.made_date = moment(notice.made_date).format('YYYY년 MM월 DD일');
    res.render('teachers/notice_detail', {session: session, data: notice});
  });
});

router.get('/handbook', (req, res) => {
  const session = req.session;

  res.render('teachers/handbook', {session: session});
});

router.post('/login', (req, res) => {
  const user = {
    userid: req.body.mem_userid,
    password: req.body.mem_password
  };
  if (user.userid && user.password) {
    db.query(`SELECT * FROM teacher WHERE email = "${user.userid}"`, (err, row) => {
      if (err) throw err;

      if (row.length > 0) {
        if (user.password == row[0].password) {
          // 로그인 코드 필요
          // res.cookie("user", row[0].teacher_id, {
          //   maxAge: 60*60*1000,
          //   httpOnly: true
          // });
          req.session.teacher_id = row[0].teacher_id;
          req.session.teacher_name = row[0].teacher_name;
          res.redirect('home');
        } else {
          res.send('<script type="text/javascript">alert("비밀번호가 일치하지 않습니다."); window.location = "login";</script>');      
        }
      } else {
        res.send('<script type="text/javascript">alert("입력한 정보를 확인해 주세요."); window.location = "login";</script>');    
      }
    });
  } else {
    res.send('<script type="text/javascript">alert("아이디와 비밀번호를 입력해 주세요."); window.location = "login";</script>');
  }
});

router.post('/signup', (req, res) => {
  const user = {
    userid: req.body.mem_userid,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    password: req.body.mem_password1,
    password2: req.body.mem_password2,
    school: req.body.school
  };
  if (user.userid && user.first_name && user.last_name && user.password && user.password2 && user.school) {
    if (user.password == user.password2) {
      db.query(`SELECT email FROM teacher WHERE email = "${user.userid}"`, (err, row) => {
        if (err) throw err;

        if (row[0] == undefined) {
          const sql = 'INSERT INTO teacher (teacher_name, school, email, password, approve) VALUES (?, ?, ?, ?, 0);';
          const params = [user.last_name + user.first_name, user.school, user.userid, user.password];
          db.query(sql, params, (err) => {
            if (err) throw err;
          });
          res.redirect('login');
        } else {
          res.send('<script type="text/javascript">alert("이미 존재하는 이메일 아이디입니다."); window.location = "signup";</script>');
        }
      });
    } else {
      res.send('<script type="text/javascript">alert("입력하신 두 비밀번호가 일치하지 않습니다."); window.location = "signup";</script>');
    };
  } else {
    res.send('<script type="text/javascript">alert("입력하신 내용 중 빈칸이 존재합니다."); window.location = "signup";</script>');
  };
});

module.exports = router;
