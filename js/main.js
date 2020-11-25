// Data Preprocessing 
var precovid_data, bubble_data;
var team_names = new Set();
var maxes = {},mins = {};

var scaleData = function(data, maxes, mins, attr) {
    return (data[attr] / maxes[attr]); //+ (mins[attr] * 0.8);
}
var preprocessData = function(data, addTeams, appendName) {
    var headers = data.resultSets[0].headers;
    var dataRows = data.resultSets[0].rowSet;

    dataRows = dataRows.map((row) => {
        var formattedRow = {};
        for (var attr=0; attr < row.length; attr++) {
            formattedRow[headers[attr]] = row[attr];

            if ((!maxes[headers[attr]] || maxes[headers[attr]] < row[attr]) && attr > 1) {
                maxes[headers[attr]] = row[attr];
            }

            if ((!mins[headers[attr]] || mins[headers[attr]] > row[attr]) && attr > 1) {
                mins[headers[attr]] = row[attr];
            }
        }

        if (addTeams)
            team_names.add(formattedRow["TEAM_NAME"]);
        return formattedRow;
    });
    
    if (addTeams) {
        var teamsDropdown = document.getElementById('teams');
        
        team_names.forEach(name => {
            d3.select(teamsDropdown)
                .append("option")
                .text(name)
                .attr("value", name);
        });
    }

    dataRows = dataRows.map(formattedRow => {
        var structuredData = {};
        structuredData.className = formattedRow["TEAM_NAME"] + appendName;
        structuredData.axes = [
            {axis : "Win Percentage", value : scaleData(formattedRow, maxes, mins, "W_PCT"), attrValue : formattedRow["W_PCT"]},
            {axis : "Field Goal Percentage", value : scaleData(formattedRow, maxes, mins, "FG_PCT"), attrValue : formattedRow["FG_PCT"]},
            {axis : "Rebounds", value : scaleData(formattedRow, maxes, mins, "REB"), attrValue : formattedRow["REB"]},
            {axis : "Assists", value : scaleData(formattedRow, maxes, mins, "AST"), attrValue : formattedRow["AST"]},
            {axis : "Steals", value : scaleData(formattedRow, maxes, mins, "STL"), attrValue : formattedRow["STL"]},
        ];

        return structuredData;
    });

    return dataRows;
}

d3.json("../data/precovid_team_data.json", function(data) {
    precovid_data = preprocessData(data, false, " (Pre-COVID)");
});

d3.json("../data/bubble_team_data.json", function(data) {
    bubble_data = preprocessData(data, true, " (Bubble)");
});


d3.select(document.getElementById('go'))
    .style("border", "1px solid black")
    .on('click', function() {
        data = precovid_data.concat(bubble_data);

        results = data.filter(data => {
            return (data.className === document.getElementById("teams").value + " (Pre-COVID)") || 
                (data.className === document.getElementById("teams").value + " (Bubble)") ;
        })
        RadarChart.draw(".chart-container", results);
    });
