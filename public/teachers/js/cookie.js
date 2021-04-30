// 문항 추가하기
$('.img_click').click(function () {
    var question_id = $(this).attr('id');
    setCookie("selected", question_id);
    location.reload();
});

// 문항 삭제하기
function delete_question(question_id) {
    var check_cookie = document.cookie.split(';');
    $.each(check_cookie, function (key, value) {
        var check_cookie_value = $.trim(value.split('=')[0])
        if (check_cookie_value == "selected") {
            var question_ids = $.trim(value.split('=')[1]).split(',')
            if (question_ids.length == 1) {
                deleteCookie("selected")
                location.reload();
            }
            else {
                question_ids = jQuery.grep(question_ids, function (value) {
                    return value != question_id;
                });
                document.cookie = "selected" + "=" + question_ids;
                location.reload();
            }
        }
    });
}

// 전체 문항 삭제
$('#delete_question').click(function () {
    if (window.confirm('선택한 문항들을 모두 취소하시겠습니까?')) {
        deleteCookie("selected")
        location.reload();
    }
});

//  쿠키로 문항 생성
$(document).ready(function () {
    if (document.cookie.indexOf("selected") >= 0) {
        var question_ids = getCookie("selected");
        $.ajax({
            url: "/teachers/question-selection/selected",
            data: { question_id: question_ids },
            success: function (data) {
                var num = data.length;
                if (num == 0) {
                    alert("검색 결과가 존재하지 않습니다.");
                } else {
                    for (var i = 0; i < num; i++) {
                        $("#selected_question").append(
                            '<div class="col-md-3 mb-5">' +
                            '<div class="card h-100" align="center">' +
                            '<div class="card-body p-0"  onclick ="delete_question(' +
                            data[i].question_id +
                            ')">' +
                            '<img id="' +
                            data[i].question_id +
                            '" class="img-fluid rounded mb-4 mb-lg-0" src="' +
                            "/static/" +
                            data[i].image +
                            '" style="width:200px; height:200px;">' +
                            "</div>" +
                            '<span class="card-footer">' +
                            '<label id="' +
                            data[i].question_id +
                            '">' +
                            data[i].question_name +
                            "</label>" +
                            "</span>" +
                            '<span class="card-footer remove_list">' +
                            '<input type="hidden" name="question" class="questions" value="' +
                            data[i].question_id +
                            '">' +
                            '<label onclick ="delete_question(' +
                            data[i].question_id +
                            ')" id="' +
                            data[i].question_id +
                            '"> <span class="colorRed">- </span> 문항 삭제</label>' +
                            "</span>" +
                            "</div>" +
                            "</div>"
                        );
                    }
                }
            },
        });
    }
});

function setCookie(cookieName, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var cookieValue = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toGMTString());
    var check_cookie = document.cookie.split(';')
    if (document.cookie.indexOf("selected") >= 0) {
        $.each(check_cookie, function (key, value) {
            var check_cookie_value = $.trim(value.split('=')[0])
            if (check_cookie_value == "selected") {
                var question_ids = $.trim(value.split('=')[1]) + "," + cookieValue
                document.cookie = cookieName + "=" + question_ids;
            }
        });
    }
    else {
        document.cookie = cookieName + "=" + cookieValue;
    }
}

function check_and_delete_cookie(cookieName, question_id) {
    var check_cookie = document.cookie.split(';')
    alert(check_cookie);
    if (document.cookie.indexOf(cookieName) >= 0) {
        $.each(check_cookie, function (key, value) {
            var check_cookie_value = $.trim(value.split('=')[1])
            alert(check_cookie_value);
        });
    }
}

function deleteCookie(cookieName) {
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
}

function getCookie(cookieName) {
    cookieName = cookieName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cookieName);
    var cookieValue = '';
    if (start != -1) {
        start += cookieName.length;
        var end = cookieData.indexOf(';', start);
        if (end == -1) end = cookieData.length;
        cookieValue = cookieData.substring(start, end);
    }
    return unescape(cookieValue);
}