const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');
const sql_query = require('./db/sql_querys');

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

router.get('/question-selection', async (req, res) => {
  try {
    const session = req.session;
    const page_num = Number(req.query.page) || 1;
    const content_size = 8;
    const page_size = 10;
    const skip_size = (page_num - 1) * content_size;

    const selectCategoryList = await sql_query.selectCategoryList();
    const selectCountQuestionList = await sql_query.selectCountQuestionList();

    const total_count = Number(selectCountQuestionList[0].count);
    const page_total = Math.ceil(total_count / content_size);
    const page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    let page_end = (page_start + page_size) - 1;

    const selectUploadQuestionList = await sql_query.selectUploadQuestionList(skip_size, content_size);

    if (page_end > page_total) page_end = page_total;
    const result = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectUploadQuestionList
    }
    res.render('teachers/question_selection', {
      session: session,
      category_data: selectCategoryList,
      category_option: null,
      user_input: null,
      question_list: result
    });
  } catch (err) {
    res.status(400);
  }
});

router.get('/question-selection-search', async (req, res) => {
  try {
    const session = req.session;
    
    const option = req.query.option;
    const user_input = req.query.user_input;
  
    const selectCategoryList = await sql_query.selectCategoryList();
      
    const page_num = Number(req.query.page) || 1;
    const content_size = 8;
    const page_size = 10;
    const skip_size = (page_num - 1) * content_size;
  
    const selectCountSearchQuestion = await sql_query.selectCountSearchQuestion(option, user_input);
  
    const total_count = Number(selectCountSearchQuestion[0].count);
    const page_total = Math.ceil(total_count / content_size);
    const page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    let page_end = (page_start + page_size) - 1;
  
    const selectSearchQuestion = await sql_query.selectSearchQuestion(option, user_input, skip_size, content_size);
  
    if (page_end > page_total) page_end = page_total;
    const result = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectSearchQuestion
    }
    res.render('teachers/question_selection', {
      session: session,
      category_data: selectCategoryList,
      category_option: option,
      user_input: user_input,
      question_list: result
    });
  } catch (err) {
    res.status(400);
  }
});

router.get('/view-result', async (req, res) => {
  try {
    const session = req.session;
    const teacher_id = session.teacher_id;
    
    const selectTeacherAssignmentList = await sql_query.selectTeacherAssignmentList(teacher_id);
      
    for (let assignment_value of selectTeacherAssignmentList) {
      assignment_value.start_date = moment(assignment_value.start_date).format('YYYY-MM-DD');
      assignment_value.end_date = moment(assignment_value.end_date).format('YYYY-MM-DD');
    }
    res.render('teachers/view_result', {
      session: session,
      assignment_data: selectTeacherAssignmentList
    });
  } catch (err) {
    res.status(400);
  }
});

router.get('/view-result/:id', (req, res) => {
  const session = req.session;
  const assignment_id = req.params.id;
  
  db.query(`SELECT * FROM assignment WHERE assignment_id = "${assignment_id}";`, (err, result) => {
    if (err) throw err;

    res.render('teachers/view_result_detail', {
      session: session,
      assignment_type: result[0].type,
    });
  });
});

router.get('/make-question', (req, res) => {
  const session = req.session;
    
  res.render('teachers/make_question', {session: session});
});

router.post('/make-question', async (req, res) => {
  try {
    let new_question = {
      question_name: req.body.question_name,
      description: req.body.description,
      image: req.body.image.split('.'),
      hint: req.body.hint,
      answer: req.body.answer,
      mark_text: req.body.mark_text
    }
    if (new_question.question_name && new_question.description && new_question.image &&
        new_question.hint && new_question.answer && new_question.mark_text) {
      
      const selectLatestMakeQuestionID = await sql_query.selectLatestMakeQuestionID();
            
      const make_question_id = selectLatestMakeQuestionID[0].make_question_id + 1;
      const teacher_id = req.session.teacher_id;
      new_question.image = `makequestion/image/make_question_${make_question_id}.${new_question.image[1]}`;
      const made_date = moment().format('YYYY-MM-DD');
  
      await sql_query.insertNewMakeQuestion(teacher_id, new_question , made_date);
      for (var mark_text of new_question.mark_text) {
        await sql_query.insertNewMark(make_question_id, mark_text);
      }
      res.send('<script type="text/javascript">alert("문항생성이 완료되었습니다."); window.location = "make-question";</script>');
    } else {
      res.send('<script type="text/javascript">alert("입력하신 내용 중 빈칸이 존재합니다."); window.location = "make-question";</script>');
    }
  } catch (err) {
    res.status(400);
  }
});

router.get('/bigram-tree', (req, res) => {
  const session = req.session;

  res.render('teachers/bigram_tree', {session: session});
});

router.get('/topic-analysis', (req, res) => {
  const session = req.session;

  res.render('teachers/topic_analysis', {session: session});
});

router.get('/response-analysis', (req, res) => {
  const session = req.session;

  res.render('teachers/response_analysis', {session: session});
});

router.get('/QR-code',async (req, res) => {
  try {
    const session = req.session;
      
    const page_num = Number(req.query.page) || 1;
    const content_size = 16;
    const page_size = 10;
    const skip_size = (page_num - 1) * content_size;
  
    const selectCategoryList = await sql_query.selectCategoryList();
    const selectCountQuestionList = await sql_query.selectCountQuestionList();
  
    const total_count = Number(selectCountQuestionList[0].count);
    const page_total = Math.ceil(total_count / content_size);
    const page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    let page_end = (page_start + page_size) - 1;
  
    const selectUploadQuestionList = await sql_query.selectUploadQuestionList(skip_size, content_size);
  
    if (page_end > page_total) page_end = page_total;
    const result = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectUploadQuestionList
    }
    res.render('teachers/QR_code', {
      session: session,
      category_data: selectCategoryList,
      category_option: null,
      user_input: null,
      question_list: result
    });
  } catch (err) {
    res.status(400);
  }
});

router.get('/QR-code-search', async (req, res) => {
  try {
    const session = req.session;
    
    const option = req.query.option;
    const user_input = req.query.user_input;
  
    const selectCategoryList = await sql_query.selectCategoryList();
      
    const page_num = Number(req.query.page) || 1;
    const content_size = 16;
    const page_size = 10;
    const skip_size = (page_num - 1) * content_size;
  
    const selectCountSearchQuestion = await sql_query.selectCountSearchQuestion(option, user_input);
  
    const total_count = Number(selectCountSearchQuestion[0].count);
    const page_total = Math.ceil(total_count / content_size);
    const page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    let page_end = (page_start + page_size) - 1;
  
    const selectSearchQuestion = await sql_query.selectSearchQuestion(option, user_input, skip_size, content_size);
  
    if (page_end > page_total) page_end = page_total;
    const result = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectSearchQuestion
    }
    res.render('teachers/QR_code', {
      session: session,
      category_data: selectCategoryList,
      category_option: option,
      user_input: user_input,
      question_list: result
    });
  } catch (err) {
    res.status(400);
  }
});

router.get('/notice', async (req, res) => {
  try {
    const session = req.session;
    
    const selectTeacherNoticeList = await sql_query.selectTeacherNoticeList();

    for (let notice_value of selectTeacherNoticeList) {
      notice_value.made_date = moment(notice_value.made_date).format('YYYY년 MM월 DD일');
    }
    res.render('teachers/notice', {
      session: session,
      data: selectTeacherNoticeList
    });

  } catch (err) {
    res.status(400);
  }
});

router.get('/notice/:id', async (req, res) => {
  try {
    const session = req.session;
    const notice_id = req.params.id;
  
    const selectTeacherNoticeDetail = await sql_query.selectTeacherNoticeDetail(notice_id);
  
    let notice = selectTeacherNoticeDetail[0];
    notice.made_date = moment(notice.made_date).format('YYYY년 MM월 DD일');
    res.render('teachers/notice_detail', {
      session: session,
      data: notice
    });
  } catch (err) {
    res.status(400);
  }
});

router.get('/handbook', (req, res) => {
  const session = req.session;

  res.render('teachers/handbook', {session: session});
});

router.post('/login', async (req, res) => {
  try {
    const user = {
      userid: req.body.mem_userid,
      password: req.body.mem_password
    };
    if (user.userid && user.password) {
      const selectTeacherInfo = await sql_query.selectTeacherInfo(user.userid);
  
      if (selectTeacherInfo.length > 0) {
        if (selectTeacherInfo[0].approve == 1) {
          if (user.password == selectTeacherInfo[0].password) {
            // 로그인 코드 필요
            // res.cookie("user", row[0].teacher_id, {
            //   maxAge: 60*60*1000,
            //   httpOnly: true
            // });
            req.session.teacher_id = selectTeacherInfo[0].teacher_id;
            req.session.teacher_name = selectTeacherInfo[0].teacher_name;
            res.redirect('home');
          } else {
            res.send('<script type="text/javascript">alert("비밀번호가 일치하지 않습니다."); window.location = "login";</script>');
          }
        } else {
          res.send('<script type="text/javascript">alert("관리자 승인이 필요한 아이디입니다."); window.location = "login";</script>');
        }
      } else {
        res.send('<script type="text/javascript">alert("입력한 정보를 확인해 주세요."); window.location = "login";</script>');    
      }
    } else {
      res.send('<script type="text/javascript">alert("아이디와 비밀번호를 입력해 주세요."); window.location = "login";</script>');
    }
  } catch (err) {
    res.status(400);
  }
});

router.post('/signup', async (req, res) => {
  try {
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
        const selectTeacherInfo = sql_query.selectTeacherInfo(user.userid);
  
        if (selectTeacherInfo[0] == undefined) {
          await sql_query.insertNewTeacher(
            user.last_name,
            user.first_name,
            user.school,
            user.userid,
            user.password
          );

          res.redirect('login');
        } else {
          res.send('<script type="text/javascript">alert("이미 존재하는 이메일 아이디입니다."); window.location = "signup";</script>');
        }
      } else {
        res.send('<script type="text/javascript">alert("입력하신 두 비밀번호가 일치하지 않습니다."); window.location = "signup";</script>');
      };
    } else {
      res.send('<script type="text/javascript">alert("입력하신 내용 중 빈칸이 존재합니다."); window.location = "signup";</script>');
    };
  } catch (err) {
    res.status(400);
  }
});

module.exports = router;
