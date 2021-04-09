create database wa3i;

use wa3i;

CREATE TABLE `teacher`(
    `teacher_id` int(11),
    `teacher_name` varchar(50),
    `school` varchar(50),
    `email` varchar(100),
    `password` varchar(50),
    `approve` boolean,
    PRIMARY KEY (`teacher_id`)
);

CREATE TABLE `assignment`(
	`assignment_id` varchar(50),
    `teacher_id` int(11),
	`assignment_title` varchar(100),
	`type` varchar(50),
	`start_date` date,
    `end_date` date,
    `made_date` date,
    `grade` int(11),
    `school_class` int(11),
	PRIMARY KEY (`assignment_id`),
	FOREIGN KEY (`teacher_id`)
      references teacher(teacher_id) on delete cascade on update cascade
);

CREATE TABLE `make_question`(
	`make_question_id` int(11),
	`teacher_id` int(11),
	`question_name` varchar(100),
	`description` text,
	`answer` longtext,
	`image` varchar(200),
	`hint` longtext,
	`made_date` date,
    `upload_check` boolean,
	PRIMARY KEY (`make_question_id`),
	FOREIGN KEY (`teacher_id`)
	  references teacher(teacher_id) on delete cascade on update cascade
);

CREATE TABLE `self_solve_data`(
	`self_id` int(11),
	`make_question_id` int(11),
	`response` longtext,
	`score` decimal(5, 2),
    `submit_date` date,
	PRIMARY KEY (`self_id`),
	FOREIGN KEY (`make_question_id`)
	  references make_question(make_question_id) on delete cascade on update cascade
);

CREATE TABLE `mark`(
	`mark_id` int(11),
	`make_question_id` int(11),
    `mark_text` varchar(200),
	PRIMARY KEY (`mark_id`),
	FOREIGN KEY (`make_question_id`)
	  references make_question(make_question_id) on delete cascade on update cascade
);

CREATE TABLE `category`(
	`category_id` int(11),
	`category_name` varchar(50),
	PRIMARY KEY (`category_id`)
);

CREATE TABLE `question`(
	`question_id` int(11),
	`category_id` int(11),
    `question_name` varchar(50),
    `descrption` text,
    `answer` longtext,
    `image` varchar(50),
    `hint` longtext,
    `made_date` date,
    `ques_concept` varchar(255),
    `ml_model_check` boolean,
    `upload_check` boolean,
	PRIMARY KEY (`question_id`),
    FOREIGN KEY (`category_id`)
	  references category(category_id) on delete cascade on update cascade
);

CREATE TABLE `keyword`(
	`keyword_id` int(11),
    `question_id` int(11),
    `keyword_name` varchar(50),
    PRIMARY KEY (`keyword_id`),
    FOREIGN KEY (`question_id`)
		references question(question_id) on delete cascade on update cascade
);

CREATE TABLE `study_solve_data`(
	`study_id` int(11),
	`question_id` int(11),
	`school` varchar(30),
	`gender` varchar(30),
	`response` longtext,
    `sentence_score` decimal(5, 2),
    `answer_score` decimal(5, 2),
    `submit_date` date,
	PRIMARY KEY (`study_id`),
	FOREIGN KEY (`question_id`)
	  references question(question_id) on delete cascade on update cascade
);

CREATE TABLE `assignment_question_rel`(
	`as_qurel_id` int(11),
	`assignment_id` varchar(50),
	`question_id` int(11),
	PRIMARY KEY (`as_qurel_id`),
	FOREIGN KEY (`assignment_id`)
      references assignment(assignment_id) on delete cascade on update cascade,
	FOREIGN KEY (`question_id`)
      references question(question_id) on delete cascade on update cascade
);

CREATE TABLE `solve`(
	`solve_id` int(11),
	`as_qurel_id` int(11),
	`student_id` int(11),
    `submit_date` date,
    `response` longtext,
    `sentence_score` decimal(5, 2),
    `answer_score` decimal(5, 2),
    `student_name` varchar(50),
	PRIMARY KEY (`solve_id`),
	FOREIGN KEY (`as_qurel_id`)
      references assignment_question_rel(as_qurel_id) on delete cascade on update cascade
);

CREATE TABLE `notice`(
	`notice_id` int(11),
    `notice_target` varchar(10),
    `notice_name` varchar(50),
    `notice_content` longtext,
    `made_date` date,
    PRIMARY KEY (`notice_id`)
);