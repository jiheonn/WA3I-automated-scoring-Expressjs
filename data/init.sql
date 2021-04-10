CREATE DATABASE wa3i;
USE wa3i;

CREATE TABLE `teacher`(
    `teacher_id` INT(11) NOT NULL AUTO_INCREMENT,
    `teacher_name` VARCHAR(50),
    `school` VARCHAR(50),
    `email` VARCHAR(100),
    `password` VARCHAR(50),
    `approve` BOOLEAN,
    PRIMARY KEY (`teacher_id`)
);

CREATE TABLE `assignment`(
	`assignment_id` VARCHAR(50),
    `teacher_id` INT(11) NOT NULL,
	`assignment_title` VARCHAR(100),
	`type` VARCHAR(50),
	`start_date` DATE,
    `end_date` DATE,
    `made_date` DATE,
    `grade` INT(11),
    `school_class` INT(11),
	PRIMARY KEY (`assignment_id`),
	FOREIGN KEY (`teacher_id`)
      REFERENCES teacher(teacher_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `make_question`(
	`make_question_id` INT(11) NOT NULL AUTO_INCREMENT,
	`teacher_id` INT(11) NOT NULL,
	`question_name` VARCHAR(100),
	`description` TEXT,
	`answer` LONGTEXT,
	`image` VARCHAR(200),
	`hint` LONGTEXT,
	`made_date` DATE,
    `upload_check` BOOLEAN,
	PRIMARY KEY (`make_question_id`),
	FOREIGN KEY (`teacher_id`)
	  REFERENCES teacher(teacher_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `self_solve_data`(
	`self_id` INT(11) NOT NULL AUTO_INCREMENT,
	`make_question_id` INT(11) NOT NULL,
	`response` LONGTEXT,
	`score` DECIMAL(5, 2),
    `submit_date` DATE,
	PRIMARY KEY (`self_id`),
	FOREIGN KEY (`make_question_id`)
	  REFERENCES make_question(make_question_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `mark`(
	`mark_id` INT(11) NOT NULL AUTO_INCREMENT,
	`make_question_id` INT(11) NOT NULL,
    `mark_text` VARCHAR(200),
	PRIMARY KEY (`mark_id`),
	FOREIGN KEY (`make_question_id`)
	  REFERENCES make_question(make_question_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `category`(
	`category_id` INT(11) NOT NULL AUTO_INCREMENT,
	`category_name` VARCHAR(50),
	PRIMARY KEY (`category_id`)
);

CREATE TABLE `question`(
	`question_id` INT(11) NOT NULL AUTO_INCREMENT,
	`category_id` INT(11) NOT NULL,
    `question_name` VARCHAR(50),
    `descrption` TEXT,
    `answer` LONGTEXT,
    `image` VARCHAR(50),
    `hint` LONGTEXT,
    `made_date` DATE,
    `ques_concept` VARCHAR(255),
    `ml_model_check` BOOLEAN,
    `upload_check` BOOLEAN,
	PRIMARY KEY (`question_id`),
    FOREIGN KEY (`category_id`)
	  REFERENCES category(category_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `keyword`(
	`keyword_id` INT(11) NOT NULL AUTO_INCREMENT,
    `question_id` INT(11) NOT NULL,
    `keyword_name` VARCHAR(50),
    PRIMARY KEY (`keyword_id`),
    FOREIGN KEY (`question_id`)
		REFERENCES question(question_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `study_solve_data`(
	`study_id` INT(11) NOT NULL AUTO_INCREMENT,
	`question_id` INT(11) NOT NULL,
	`school` VARCHAR(30),
	`gender` VARCHAR(30),
	`response` LONGTEXT,
    `sentence_score` DECIMAL(5, 2),
    `answer_score` DECIMAL(5, 2),
    `submit_date` DATE,
	PRIMARY KEY (`study_id`),
	FOREIGN KEY (`question_id`)
	  REFERENCES question(question_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `assignment_question_rel`(
	`as_qurel_id` INT(11) NOT NULL AUTO_INCREMENT,
	`assignment_id` VARCHAR(50) NOT NULL,
	`question_id` INT(11) NOT NULL,
	PRIMARY KEY (`as_qurel_id`),
	FOREIGN KEY (`assignment_id`)
      REFERENCES assignment(assignment_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`question_id`)
      REFERENCES question(question_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `solve`(
	`solve_id` INT(11) NOT NULL AUTO_INCREMENT,
	`as_qurel_id` INT(11) NOT NULL,
	`student_id` INT(11),
    `submit_date` DATE,
    `response` LONGTEXT,
    `sentence_score` DECIMAL(5, 2),
    `answer_score` DECIMAL(5, 2),
    `student_name` VARCHAR(50),
	PRIMARY KEY (`solve_id`),
	FOREIGN KEY (`as_qurel_id`)
      REFERENCES assignment_question_rel(as_qurel_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `notice`(
	`notice_id` INT(11) NOT NULL AUTO_INCREMENT,
    `notice_target` VARCHAR(10),
    `notice_name` VARCHAR(50),
    `notice_content` LONGTEXT,
    `made_date` DATE,
    PRIMARY KEY (`notice_id`)
);