function showResponseAnalysis() {
    $('#front-page').css("display", "none");
    $('#back-page').css({"display": "block", 
                              "justify-content": "center",
                              "align-items": "center",
                              "margin": "5%",
                              "min-width": "100%",
                              "min-height": "100%",
                            });
}

global_set_num = 0;
global_keywords_dict = {};
global_color_dict = {};
default_color_set = [rgb(240, 90, 115), rgb(141, 137, 238), rgb(241, 180, 164), rgb(166, 231, 88),
                      rgb(241, 219, 105), rgb(232, 158, 219), rgb(115, 80, 80), rgb(80, 122, 24), rgb(26, 130, 196), rgb(40, 196, 117)];

$("#submitbutton").on("click", function(){
    var myheader = $("#header").val() == "true";
    var f = $("#validatedCustomFile")[0].files[0];

    if(!f){
        alert("No file selected.");
        return;
    }

    if (f) {
        var extension = f.name.split('.').pop();
        if (extension !== 'csv' && extension !== 'xlsx') { 
            alert('csv 파일 또는 엑셀 파일로 올려주세요.'); 
            return; 
        }

        $('#sentences').html("");

        if (extension == 'xlsx') {
            var r = new FileReader();
            r.onload = function() {
                var data = r.result;
                var workBook = XLSX.read(data, { type: 'binary' });
                workBook.SheetNames.forEach(function(sheetName) {
                    var rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName], {header: 1});
                    var output = [];
                    header_sentence = "응답 리스트";
                    output.push("<tr class='tr-header'><td>" + header_sentence + "</td></tr>");
                    for (var i=0; i<rows.length; i++){
                        sentence = JSON.stringify(rows[i][0]);
                        try {
                            output.push("<tr class='tr-sentence tr-sentence-"+i+"'><td><a class='word'>" + sentence.split(" ").join("</a> <a class='word'>") + "</a></td></tr>");
                        } catch(err) {
                            continue;
                        }
                    }
                    output = "<table id='count_table'>" + output.join("") + "</table>";
                    $('#sentences').append(output);
                })
            };
            r.readAsBinaryString(f);
        }

        if (extension == 'csv') {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                var lines = contents.split("\n"), output = [];
                header_sentence = lines[0].split(",");
                output.push("<tr class='tr-header'><td>" + header_sentence[0] + "</td></tr>")
                for (var i=1; i<lines.length; i++){
                    row = lines[i].split(",");
                    sentence = row[0];

                    try {
                        output.push("<tr class='tr-sentence tr-sentence-"+i+"'><td><a class='word'>" + sentence.split(" ").join("</a> <a class='word'>") + "</a></td></tr>");
                    } catch(err) {
                        continue;
                    }
                }
                output = "<table id='count_table'>" + output.join("") + "</table>";
                $('#sentences').append(output);
            }
            r.readAsText(f);
        }
        
    } else {
      alert("Failed to load file");
    }
});

$("#validatedCustomFile").change(function(e) {
    var fileName = e.target.files[0].name;
    $('.custom-file-label').html(fileName);
});

function addKeyWords(){
    inputWords = document.getElementById('addKeyWords-input').value;
    inputWords = inputWords.trim();
    if (inputWords.length < 1) {
      alert("no input.");
      return;
    }

    default_color = default_color_set[global_set_num % default_color_set.length];
    html_color_button = "<input id='"+global_set_num+"' onchange=\"colorUpdate(this.jscolor,"+global_set_num+");\" class=\"jscolor {value:'"+default_color+"'}\" style=\"width: 20px; height: 20px;\">";
    append_header = "<td class='count-header-" +
                      global_set_num +
                      "'>" + "<center><button type='button' class='close' aria-label='Close' style='float:center;' onclick='closeButtonClick("+global_set_num+")'><div aria-hidden='true'>&times;</div></button></center>"
                      + "<br><center>" + html_color_button + "</center><br><center>"
                      + inputWords + "</center></td>";

    $(".tr-header").append(append_header);
    append_sentence = "<td class='count-"+global_set_num+"'>0</td>";
    $(".tr-sentence").each(function() {
      $(this).append(append_sentence);
    });

    addKeyWordsSet(global_set_num, inputWords, default_color);

    jscolor.installByClassName("jscolor"); // activating jscolor classes which have been dynamically inserted.
    document.getElementById('addKeyWords-input').value = "";
    global_set_num++;
    console.log(inputWords + " are added.");
}

function closeButtonClick(set_num){
    $(".count-header-"+set_num).fadeOut(500, function(){ $(this).remove(); });
    $(".count-"+set_num).fadeOut(500, function(){ $(this).remove(); });
    deleteKeyWordsSet(set_num);
}

function addKeyWordsSet(set_num, keyWordSet, default_color){
      global_keywords_dict[set_num] = keyWordSet;
      global_color_dict[set_num] = default_color;
      highlightKeyWordsSet(set_num);

}

function highlightKeyWordsSet(set_num) {
    inputWordsArr = global_keywords_dict[set_num].split(" ");
    for (var i=0; i<inputWordsArr.length; i++) {
      $('.word').each(function(){
        var each_word = $(this).text();
        if (each_word.includes(inputWordsArr[i])) {
            $(this).addClass('a-set-' + set_num);
        }
      });
    }
    $('.a-set-' + set_num).css('background-color', '#' + global_color_dict[set_num]);
    countKeyWordsSet(set_num);
}

function countKeyWordsSet(set_num) {
    inputWordsArr = global_keywords_dict[set_num].split(" ");
    for (var i=0; i<inputWordsArr.length; i++) {
      $('[class^="tr-sentence"]').each(function(){
        var count = $(this).find('.a-set-' + set_num).length;
        $(this).find('.count-'+set_num).text(count);
      });

    }
}

function deleteKeyWordsSet(set_num){
    $('.a-set-' + set_num).css('background-color', 'transparent');
    $('.a-set-' + set_num).each(function(){
    $(this).removeClass('a-set-' + set_num);
    if ($(this).is('[class*="a-set"]')) {
        class_list = $(this).attr('class').split(/\s+/);
        remain_set_num = class_list[class_list.length-1].split("-")[2];
        $('.' + class_list[class_list.length-1]).css('background-color', '#' + global_color_dict[remain_set_num]);
    }
    });
    delete global_keywords_dict[set_num];
    delete global_color_dict[set_num];
}

function rgb(r, g, b) {
    r = r.toString(16).length == 2 ? r.toString(16) : "0" + r.toString(16);
    g = g.toString(16).length == 2 ? g.toString(16) : "0" + g.toString(16);
    b = b.toString(16).length == 2 ? b.toString(16) : "0" + b.toString(16);
    return r + g + b;
}

function colorUpdate(jscolor, set_num) {
    global_color_dict[set_num] = jscolor;
    $('.a-set-' + set_num).css('background-color', '#' + jscolor);
}

function checkKeyPressed(e) {
    if (e.keyCode == "13") {
      addKeyWords();
    }
}

$('#addKeyWords-input').focus(function(e){
    window.addEventListener("keydown", checkKeyPressed, false);
});

$('#addKeyWords-input').blur(function(e){
    window.removeEventListener("keydown", checkKeyPressed, false);
});

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Start file download.
document.getElementById("dwn-btn").addEventListener("click", function(){
    var tr_list = $('#count_table').children().children("tr");
    var text = "";
    tr_list.each(function(e) {
    $(this).children("td").each(function() {
        text += $(this).text().replace(/\'|\"|×|\n|\r|,/g,"") + ",";
    });
    text += "\n";
    });

    text = "\ufeff" + encodeURIComponent(text);
    var filename = "COUNT.csv";
    download(filename, text);
}, false);

document.getElementById('response_analysis_submit_btn').onclick = function() {
    showResponseAnalysis();
};
