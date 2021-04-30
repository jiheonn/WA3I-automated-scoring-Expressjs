const express = require('express');
const moment = require('moment');
const router = express.Router();
// const db = require('../lib/db');
const sql_query = require('./db/sql_querys');


var session, t_id, a_id,

  // pagination
  page_num, content_size, page_size, skip_size,
  total_count, page_total, page_start, page_end,
  paged_value,
  selectCategoryList, selectCountQuestionList, selectPagedQuestionList,
  // search question
  option, user_input,
  selectCountSearchQuestion, selectSearchQuestion,
  // question-selection
  selectAssignmentID, selectQuestionInfo, selected_question_list, newAssignment,
  // view-result
  selectTeacherAssignmentList, selectAssignmentInfo, selectAssignmentSolveList,
  selectAssignmentQuestionList,
  // auth
  user, selectTeacherInfo;


/* teacher view login */
// /teachers/login
router.get('/login', (req, res) => {
  session = req.session;
  t_id = session.teacher_id;

  // 로그인된 상황
  if (t_id) res.redirect('home');
  else res.render('teachers/login');
});

/* teacher view signup */
// /teachers/signup
router.get('/signup', (req, res) => {
  res.render('teachers/signup');
});

/* teacher logout */
// /teachers/logout
router.get('/logout', (req, res) => {
  session = req.session;

  session.destroy();
  res.clearCookie('sid');

  res.redirect('login');
});

/* teacher view "홈" */
// /teachers/home
router.get('/home', (req, res) => {
  session = req.session;

  res.render('teachers/home', {
    session: session
  });
});

/* teacher view "문항선택" */
// /teachears/question-selection?page=1
router.get('/question-selection', async (req, res) => {
  try {
    session = req.session;

    // pagination
    page_num = req.query.page;
    // 문자열이므로 숫자형으로 변환 필요, 0이면 기본 값 1로 대체
    page_num = Number(page_num) || 1;

    // 한 페이지에 보여줄 컨텐츠 수
    content_size = 8;
    // 한 페이지에 보여줄 페이지 수
    page_size = 10;
    // 요청한 페이지에 해당하는 컨텐츠 시작 지점
    skip_size = (page_num - 1) * content_size;

    // 문항 카테고리
    selectCategoryList = await sql_query.selectCategoryList();
    // 총 문항 수
    selectCountQuestionList = await sql_query.selectCountQuestionList();

    // 쿼리 값인 문자열이므로 숫자형으로 변환 필요
    total_count = selectCountQuestionList[0].count;
    total_count = Number(total_count);

    page_total = Math.ceil(total_count / content_size);
    page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    page_end = (page_start + page_size) - 1;

    selectPagedQuestionList = await sql_query.selectPagedQuestionList(skip_size, content_size);

    if (page_end > page_total) page_end = page_total;

    paged_value = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectPagedQuestionList
    };

    res.render('teachers/question_selection', {
      session: session,
      category_data: selectCategoryList,
      category_option: null,
      user_input: null,
      question_list: paged_value
    });

  } catch (err) {
    res.status(400);
  }

  // initialize
  page_num, content_size, page_size, skip_size,
    selectCategoryList, selectCountQuestionList,
    total_count, page_total, page_start, page_end,
    selectPagedQuestionList,
    paged_value;
});

/* teacher view "문항선택" > search question */
// /teachears/question-selection-search?page=2&option=과학&user_input=전기
router.get('/question-selection-search', async (req, res) => {
  try {
    session = req.session;

    // 카테고리 & 검색어
    option = req.query.option;
    user_input = req.query.user_input;

    selectCategoryList = await sql_query.selectCategoryList();

    //pagination
    page_num = req.query.page;
    // 문자열이므로 숫자형으로 변환 필요, 0이면 기본 값 1로 대체
    page_num = Number(page_num) || 1;

    // 한 페이지에 보여줄 컨텐츠 수
    content_size = 8;
    // 한 페이지에 보여줄 페이지 수
    page_size = 10;
    // 요청한 페이지에 해당하는 컨텐츠 시작 지점
    skip_size = (page_num - 1) * content_size;

    selectCountSearchQuestion = await sql_query.selectCountSearchQuestion(option, user_input);

    // 쿼리 값인 문자열이므로 숫자형으로 변환 필요
    total_count = selectCountSearchQuestion[0].count;
    total_count = Number(total_count);

    page_total = Math.ceil(total_count / content_size);
    page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    page_end = (page_start + page_size) - 1;

    selectSearchQuestion = await sql_query.selectSearchQuestion(option, user_input, skip_size, content_size);

    if (page_end > page_total) page_end = page_total;

    paged_value = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectSearchQuestion
    };

    res.render('teachers/question_selection', {
      session: session,
      category_data: selectCategoryList,
      category_option: option,
      user_input: user_input,
      question_list: paged_value
    });

  } catch (err) {
    res.status(400);
  }

  // initialize
  option, user_input,
    selectCategoryList,
    page_num, content_size, page_size, skip_size,
    selectCountSearchQuestion,
    total_count, page_total, page_start, page_end,
    selectSearchQuestion,
    paged_value;
});

/* teahcer view "question-selection" > 과제 코드 중복 확인 */
// /teachers/question-selection/check-assignmentid
router.get('/question-selection/check-assignmentid', async (req, res) => {
  try {
    a_id = req.query.text;

    selectAssignmentID = await sql_query.selectAssignmentID(a_id);
    if (selectAssignmentID.length == 0) {
      res.json(a_id);
    } else {
      res.json('생성 버튼을 다시 눌러주세요.');
    }

  } catch (err) {
    res.status(400);
  }

  // initialize
  a_id, selectAssignmentID;
});

/* teacher view "question-selection" > "+ 문항 추가 버튼" */
// /teachers/question-selection/selected
router.get('/question-selection/selected', async (req, res) => {
  try {
    // 현재 문자열 값 ex) req.query = { question_id: '4, 5, 3, 9' }
    selected_question_list = req.query.question_id;

    // 배열로 변환하여 str > int 형 변환
    selected_question_list = selected_question_list.split(',');
    for (var i = 0; i < selected_question_list.length; i++) {
      selected_question_list[i] = parseInt(selected_question_list[i]);
    }

    selectQuestionInfo = await sql_query.selectQuestionInfo(selected_question_list);

    res.json(selectQuestionInfo);

  } catch (err) {
    res.status(400);
  }

  // initialize
  selected_question_list, selectQuestionInfo
});

/* teacher view "문항선택" add assignment */
// /teachers/question-selection
router.post('/question-selection', async (req, res) => {
  try {
    newAssignment = req.body;

    // 과제를 생성한 선생님 id session에서 추출
    session = req.session;
    t_id = session.teacher_id;

    newAssignment['teacher_id'] = t_id;
    // 과제 생성 시점의 날짜
    newAssignment['made_date'] = moment().format('YYYY-MM-DD');

    console.log(newAssignment);

    // 사용자가 입력한 값 중 빈 칸이 없는 지 확인
    if (newAssignment.question &&
      newAssignment.evaluation_type &&
      newAssignment.code_num &&
      newAssignment.question_title &&
      newAssignment.grade &&
      newAssignment.class &&
      newAssignment.start_date &&
      newAssignment.end_date) {

      await sql_query.insertNewAssignment(newAssignment);

      // var count_question = newAssignment.question.length;
      // var assignment_id = newAssignment.code_num;
      // for (var i = 0; i > count_question; i++) {
      //   var question_id = newAssignment.question[i];
      //   await sql_query.insertNewAssignmentQuestionRel(assignment_id, question_id);
      // }

      res.send(
        '<script type="text/javascript"> \
                alert("문항생성이 완료되었습니다."); \
                window.location = "question-selection"; \
              </script>'
      );
    } else {
      res.send(
        '<script type="text/javascript"> \
          alert("입력하신 내용 중 빈 칸이 존재합니다."); \
          window.location = "make-question"; \
        </script>'
      );
    }

  } catch (err) {
    res.status(400);
  }

  // initialize
});

/* teacher view "결과보기" */
// /teachers/view-result
router.get('/view-result', async (req, res) => {
  try {
    session = req.session;
    t_id = session.teacher_id;

    selectTeacherAssignmentList = await sql_query.selectTeacherAssignmentList(t_id);

    for (var assignment_value of selectTeacherAssignmentList) {
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

  // initialize
  selectTeacherAssignmentList;
});

/* teacher view "결과보기" detail view */
// /teachers/view-result/546A5N3Q
router.get('/view-result/:id', async (req, res) => {
  try {
    session = req.session;
    var a_id = req.params.id;

    selectAssignmentInfo = await sql_query.selectAssignmentInfo(a_id);

    selectAssignmentSolveList = await sql_query.selectAssignmentSolveList(a_id);

    selectAssignmentQuestionList = await sql_query.selectAssignmentQuestionList(a_id);

    for (var assignment_value of selectAssignmentInfo) {
      assignment_value.start_date = moment(assignment_value.start_date).format('YYYY-MM-DD');
      assignment_value.end_date = moment(assignment_value.end_date).format('YYYY-MM-DD');
    }

    res.render('teachers/view_result_detail', {
      session: session,
      assignment_data: selectAssignmentInfo,
      assignment_id: selectAssignmentInfo[0].assignment_id,
      assignment_type: selectAssignmentInfo[0].type,
      question_list: selectAssignmentQuestionList,
    });

  } catch (err) {
    res.status(400);
  }

  // initialize
  selectAssignmentInfo, selectAssignmentSolveList, selectAssignmentQuestionList;
});

/* teacher view "결과보기" detail view > chart */
// /teachers/view-result/546A5N3Q
router.post('/view-result/:id/chart', (req, res) => {
  //
});

/* teacher view "문항생성" */
// /teachers/make-question
router.get('/make-question', (req, res) => {
  session = req.session;

  res.render('teachers/make_question', {
    session: session
  });
});

/* teacher view "문항생성" add question */
// /teachers/make-question
router.post('/make-question', async (req, res) => {
  try {
    var new_question = {
      question_name: req.body.question_name,
      description: req.body.description,
      image: req.body.image.split('.'),
      hint: req.body.hint,
      answer: req.body.answer,
      mark_text: req.body.mark_text
    }
    if (
      new_question.question_name &&
      new_question.description &&
      new_question.image &&
      new_question.hint &&
      new_question.answer &&
      new_question.mark_text
    ) {
      var selectLatestMakeQuestionID = await sql_query.selectLatestMakeQuestionID();

      var make_question_id = selectLatestMakeQuestionID[0].make_question_id + 1;
      t_id = req.session.teacher_id;
      new_question.image = `makequestion/image/make_question_${make_question_id}.${new_question.image[1]}`;
      var made_date = moment().format('YYYY-MM-DD');

      await sql_query.insertNewMakeQuestion(t_id, new_question, made_date);
      for (var mark_text of new_question.mark_text) {
        await sql_query.insertNewMark(make_question_id, mark_text);
      }
      res.send(
        '<script type="text/javascript"> \
          alert("문항생성이 완료되었습니다."); \
          window.location = "make-question"; \
        </script>'
      );
    } else {
      res.send(
        '<script type="text/javascript"> \
          alert("입력하신 내용 중 빈칸이 존재합니다."); \
          window.location = "make-question"; \
        </script>'
      );
    }
  } catch (err) {
    res.status(400);
  }
});

/* teacher view "Bigram tree" */
// /teachers/bigram-tree
router.get('/bigram-tree', (req, res) => {
  session = req.session;

  res.render('teachers/bigram_tree', {
    session: session
  });
});

/* teacher view "주제분석" */
// /teachers/topic-analysis
router.get('/topic-analysis', (req, res) => {
  session = req.session;

  res.render('teachers/topic_analysis', {
    session: session
  });
});

/* teacher view "응답분석" */
// /teachers/response-analysis
router.get('/response-analysis', (req, res) => {
  session = req.session;

  res.render('teachers/response_analysis', {
    session: session
  });
});

/* teacher view "QR code" */
// /teachers/QR-code?page=1
router.get('/QR-code', async (req, res) => {
  try {
    session = req.session;

    // pagination
    page_num = req.query.page;
    // 문자열이므로 숫자형으로 변환 필요, 0이면 기본 값 1로 대체
    page_num = Number(page_num) || 1;

    // 한 페이지에 보여줄 컨텐츠 수
    content_size = 16;
    // 한 페이지에 보여줄 페이지 수
    page_size = 10;
    // 요청한 페이지에 해당하는 컨텐츠 시작 지점
    skip_size = (page_num - 1) * content_size;

    selectCategoryList = await sql_query.selectCategoryList();
    selectCountQuestionList = await sql_query.selectCountQuestionList();

    // 쿼리 값인 문자열이므로 숫자형으로 변환 필요
    total_count = selectCountQuestionList[0].count;
    total_count = Number(total_count);


    page_total = Math.ceil(total_count / content_size);
    page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    page_end = (page_start + page_size) - 1;

    selectPagedQuestionList = await sql_query.selectPagedQuestionList(skip_size, content_size);

    if (page_end > page_total) page_end = page_total;

    paged_value = {
      page_num,
      page_start,
      page_end,
      page_total,
      contents: selectPagedQuestionList
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

  // initialize
  page_num, content_size, page_size, skip_size,
    selectCategoryList, selectCountQuestionList,
    total_count, page_total, page_start, page_end,
    selectPagedQuestionList,
    paged_value;
});

/* teacher view "QR code" search question */
// /teachers/QR-code-search?page=2&option=과학&user_input=전기
router.get('/QR-code-search', async (req, res) => {
  try {
    session = req.session;

    option = req.query.option;
    user_input = req.query.user_input;

    selectCategoryList = await sql_query.selectCategoryList();

    // pagination
    page_num = req.query.page;
    // 문자열이므로 숫자형으로 변환 필요, 0이면 기본 값 1로 대체
    page_num = Number(page_num) || 1;

    // 한 페이지에 보여줄 컨텐츠 수
    content_size = 16;
    // 한 페이지에 보여줄 페이지 수
    page_size = 10;
    // 요청한 페이지에 해당하는 컨텐츠 시작 지점
    skip_size = (page_num - 1) * content_size;

    selectCountSearchQuestion = await sql_query.selectCountSearchQuestion(option, user_input);

    // 쿼리 값인 문자열이므로 숫자형으로 변환 필요
    total_count = selectCountSearchQuestion[0].count;
    total_count = Number(total_count);

    page_total = Math.ceil(total_count / content_size);
    page_start = ((Math.ceil(page_num / page_size) - 1) * page_size) + 1;
    page_end = (page_start + page_size) - 1;

    selectSearchQuestion = await sql_query.selectSearchQuestion(option, user_input, skip_size, content_size);

    if (page_end > page_total) page_end = page_total;

    paged_value = {
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

  // initialize
  option, user_input,
    selectCategoryList,
    page_num, content_size, page_size, skip_size,
    selectCountSearchQuestion,
    total_count, page_total, page_start, page_end,
    selectSearchQuestion,
    paged_value;
});

/* teacher view "공지사항" */
// /teachers/notice
router.get('/notice', async (req, res) => {
  try {
    session = req.session;

    var selectTeacherNoticeList = await sql_query.selectTeacherNoticeList();

    for (var notice_value of selectTeacherNoticeList) {
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

/* teacher view "공지사항" detail view */
// /teachers/notice/1
router.get('/notice/:id', async (req, res) => {
  try {
    session = req.session;
    var notice_id = req.params.id;

    var selectTeacherNoticeDetail = await sql_query.selectTeacherNoticeDetail(notice_id);

    var notice = selectTeacherNoticeDetail[0];
    notice.made_date = moment(notice.made_date).format('YYYY년 MM월 DD일');

    res.render('teachers/notice_detail', {
      session: session,
      data: notice
    });

  } catch (err) {
    res.status(400);
  }
});

/* teacher view "활용가이드" */
// /teachers/handbook
router.get('/handbook', (req, res) => {
  session = req.session;

  res.render('teachers/handbook', {
    session: session
  });
});

/* teacher auth login */
// /teachers/login
router.post('/login', async (req, res) => {
  try {
    user = {
      userid: req.body.mem_userid,
      password: req.body.mem_password
    };
    // 빈 값 확인
    if (user.userid && user.password) {
      selectTeacherInfo = await sql_query.selectTeacherInfo(user.userid);
      // 입력한 아이디가 DB에 존재하는 지 확인
      if (selectTeacherInfo.length > 0) {
        selectTeacherInfo = selectTeacherInfo[0];
        // 관리자 승인되었는 지 확인
        if (selectTeacherInfo.approve == 1) {
          // 입력한 비밀번호와 DB 비밀번호 동일한 지 확인
          if (user.password == selectTeacherInfo.password) {
            // 세션 발급
            req.session.teacher_id = selectTeacherInfo.teacher_id;
            req.session.teacher_name = selectTeacherInfo.teacher_name;
            res.redirect('home');
          } else {
            res.send(
              '<script type="text/javascript"> \
                alert("비밀번호가 일치하지 않습니다."); \
                window.location = "login"; \
              </script>'
            );
          }
        } else {
          res.send(
            '<script type="text/javascript"> \
              alert("관리자 승인이 필요한 아이디입니다."); \
              window.location = "login"; \
            </script>'
          );
        }
      } else {
        res.send(
          '<script type="text/javascript"> \
            alert("입력한 정보를 확인해 주세요."); \
            window.location = "login"; \
          </script>'
        );
      }
    } else {
      res.send(
        '<script type="text/javascript"> \
          alert("아이디와 비밀번호를 입력해 주세요."); \
          window.location = "login"; \
        </script>'
      );
    }
  } catch (err) {
    res.status(400);
  }

  // initialize
  user, selectTeacherInfo;
});

/* teacher auth signup */
// /teachers/signup
router.post('/signup', async (req, res) => {
  try {
    user = {
      userid: req.body.mem_userid,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: req.body.mem_password1,
      password2: req.body.mem_password2,
      school: req.body.school
    };
    // 빈 값 확인
    if (user.userid &&
      user.first_name &&
      user.last_name &&
      user.password &&
      user.password2 &&
      user.school
    ) {
      // 비밀번호와 비밀번호 재확인
      if (user.password == user.password2) {
        selectTeacherInfo = sql_query.selectTeacherInfo(user.userid);
        // 이메일 중복 확인
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
          res.send(
            '<script type="text/javascript"> \
              alert("이미 존재하는 이메일 아이디입니다."); \
              window.location = "signup"; \
            </script>'
          );
        }
      } else {
        res.send(
          '<script type="text/javascript"> \
            alert("입력하신 두 비밀번호가 일치하지 않습니다."); \
            window.location = "signup"; \
          </script>'
        );
      };
    } else {
      res.send(
        '<script type="text/javascript"> \
          alert("입력하신 내용 중 빈칸이 존재합니다."); \
          window.location = "signup"; \
        </script>'
      );
    };

  } catch (err) {
    res.status(400);
  }

  // initialize
  user, selectTeacherInfo;
});

module.exports = router;
