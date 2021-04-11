var api_server = 'http://' + wai.best + ':' + 5252;
var version = 'keywords';

function getTopicAnalysis() {
    var file = $("#topic-modeling-file")[0].files[0];
    var topic_count = document.getElementById("topic_count").value;
    if (file) {
        var extension = file.name.split('.').pop();
    } else {
        alert('파일을 업로드 해주세요.');
        buttonReset();
        return;
    }

    if (extension !== 'csv' && extension !== 'xlsx') { 
        alert('csv 파일 또는 엑셀 파일로 올려주세요.'); 
        buttonReset(); 
        return; 
    }

    if (topic_count > 10 || topic_count < 2) {
        alert("토픽 개수는 최소 2개, 최대 10개까지 입력이 가능합니다.");
        buttonReset();
        return false;
    }

    var isChecked = $('input:checkbox[name="version"]').is(":checked");
    if (isChecked == true) {
        version = 'sentences';
    } else {
        version = 'keywords';
    }

    var form_data = new FormData();
    form_data.append('file', file);
    form_data.append('num_topic', topic_count);
    form_data.append('extension', extension);
    form_data.append('version', version);
    $.ajax({
        url: api_server + '/get-topic-analysis',
        type: 'POST',
        dataType: 'json',
        processData: false,
        contentType: false,
        data: form_data,
        tryCount: 0,
        retryLimit : 10,
        success: function(response) {
            topicAnalysisResult(response.data);
            buttonReset()
        }, error: function(e) { 
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }   
            buttonReset()
            alert('파일의 형식이 알맞지 않습니다. 문장이 첫 번째 시트와 열에만 있어야 합니다.'); return; },
    });
}

function topicAnalysisResult(data) {
    $('#input-page').css("display", "none");
    $('#topic-modeling').css({"display": "flex", 
                              "flexDirection": "row",
                              "justifyContent": "center",
                              "alignItems": "center",
                              "margin": "5%",
                              "minWidth": "100%",
                              "minHeight": "100%",
                            });
    $('#vis-tmtable').css({"margin": "2%", "minWidth": "50%"});
    $('#vis-tsne').css({"margin": "2%", "minWidth": "50%"});

    tabulateTopics(data.topics);
    visualizeTSNE(data.tsne);
}

// https://gist.github.com/jfreels/6734025
function tabulateTopics(data) {
    
    var table = d3.select("#vis-tmtable").append("table");
    var thead = table.append("thead");
    var tbody = table.append("tbody");
    var columns = [];
    for (var i = 0; i < data.length; i++) {
        columns.push("주제 " + (i+1).toString());   // zero-based indexing -> one-based
    }

    table.style("margin-left", "auto");
    table.style("margin-right", "auto");

    // Append the header row
    thead.append("tr")
         .selectAll("th")
         .data(columns)
         .enter()
         .append("th")
            .style("padding", "3px 7px")
            .style("text-align", "center")
            .text(function(col) { return col; });
    
    // need to convert to json array in order to draw
    var topic_modeling_data = JSObject2JSONArray(data);

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
                    .data(topic_modeling_data)
                    .enter()
                    .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
                    .data(function(row) {
                        return columns.map(function(column) {
                            let oldColName = column.split(" ")[1];  // assumes "주제 [col#]" format
                            oldColName = (parseInt(oldColName)-1).toString();   // fix back to zero-based index
                            return {column: column, value: row[oldColName]}
                        });
                    })
                    .enter()
                    .append("td")
                        .style("padding", "3px 7px")
                        .style("text-align", "center")
                        .text(function(d) { return d.value; });
}

// https://www.d3-graph-gallery.com/graph/scatter_grouped_highlight.html
function visualizeTSNE(data) {

    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 575 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#vis-tsne")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear()
                .domain([Math.round(Math.min(...data.x))-1, Math.round(Math.max(...data.x))+1])
                .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    // Add Y axis
    var y = d3.scaleLinear()
                .domain([Math.round(Math.min(...data.y))-1, Math.round(Math.max(...data.y))+1])
                .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    
    // Color scale: topic number -> return color
    var color = d3.scaleOrdinal()
                    .domain(data.topic)
                    .range(data.color);

    // Define the div for the tooltip
    // var div = d3.select("body").append("div")
    var div = d3.select("section").append("div")
                .attr("class", "tooltip")				
                .style("opacity", 0)
                .style("width", function() {
                    if (version == 'sentences') return '180px';
                    else return '60px';
                })
                .style("height", function() {
                    if (version == 'sentences') return '100px';
                    else return '28px';
                });
    
    // Highlight the topic that is hovered
    var highlight = function(d) {
        selected_topic = d.topic;
        selected_color = d.color;
        selected_keyword = d.document;

        // default
        d3.selectAll(".dot")
            .transition()
            .duration(200)
            .attr("r", 3);
        
        // highlight selected topic
        d3.selectAll(".topic" + selected_topic)
            .transition()
            .duration(200)
            .style("fill", function(){
                return selected_color;
            })
            .attr("r", 10);
        
        // put up selected keyword as tooltip
        div.transition()
            .duration(200)
            .style("opacity", 1);
        div.html((parseInt(selected_topic) + 1) + " : " + selected_keyword)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");	
    }

    var doNotHighlight = function() {
        d3.selectAll(".dot")
            .transition()
            .duration(500)
            .attr("r", 7);
        
        div.transition()
            .duration(500)
            .style("opacity", 0);
    }

    // need to convert to json array in order to draw
    var tsne_data = JSObject2JSONArray(data);

    // Add dots & labels
    var node = svg.append('g')
                    .selectAll("dot")
                    .data(tsne_data)
                    .enter();
                    
    var circles = node.append("circle")
                        .attr("class", function(d) { return "dot topic" + d.topic })
                        .attr("cx", function(d) { return x(d.x) })
                        .attr("cy", function(d) { return y(d.y) })
                        .attr("r", 7)
                        .style("fill", function(d) { return d.color; })
                    .on("mouseover", highlight)
                    .on("mouseleave", doNotHighlight);
                
    var labels = node.append("text")
                        .attr("class", function(d) { return "label" + d.id })
                        .attr("x", function(d) { return x(d.x) })
                        .attr("y", function(d) { return y(d.y) })
                        .attr("text-anchor", "middle")
                        .text(function(d) { return d.document })
                    .on("mouseover", highlight)
                    .on("mouseleave", doNotHighlight);
}

function JSObject2JSONArray(jsObject) {
    
    // pre-allocate space for json array
    var n = Object.values(jsObject)[0].length;  // assumes all values have same length
    var jsonArray = [];
    for (var i = 0; i < n; i++){
        jsonArray.push({});
    }

    // update json(dictionary)
    for (const [attr, values] of Object.entries(jsObject)) {
        for (var i = 0; i < n; i++) {
            jsonArray[i][attr] = values[i];
        }
    }

    return jsonArray;
}

function buttonLoading() {
    $('#topic-modeling-submit-btn').attr("disabled", true);
    $('#topic-modeling-submit-btn').html( function() {
        state = '<i class="fa fa-spinner fa-spin"></i> 로딩중';
        return state;
    });
}

function buttonReset() {
    $('#topic-modeling-submit-btn').attr("disabled", false);
    $('#topic-modeling-submit-btn').html("실행");
}

document.getElementById('topic-modeling-submit-btn').onclick = function() {
    buttonLoading();
    getTopicAnalysis();
};
