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

    //format data rows with the features to be displayed in the radar chart
    dataRows = dataRows.map(formattedRow => {
        var structuredData = {};
        structuredData.className = formattedRow["TEAM_NAME"] + appendName;
        structuredData.axes = [
            {axis : "Win Percentage", value : scaleData(formattedRow, maxes, mins, "W_PCT"), attrValue : (formattedRow["W_PCT"] * 100).toFixed(2) + "%"},
            {axis : "Rebounds", value : scaleData(formattedRow, maxes, mins, "REB"), attrValue : formattedRow["REB"]},
            {axis : "Assists", value : scaleData(formattedRow, maxes, mins, "AST"), attrValue : formattedRow["AST"]},
            {axis : "Steals", value : scaleData(formattedRow, maxes, mins, "STL"), attrValue : formattedRow["STL"]},
            {axis : "Blocks", value : scaleData(formattedRow, maxes, mins, "BLK"), attrValue : formattedRow["BLK"]},
            {axis : "Field Goal Percentage", value : scaleData(formattedRow, maxes, mins, "FG_PCT"), attrValue : (formattedRow["FG_PCT"] * 100).toFixed(2) + "%"},
            {axis : "Free Throw Percentage", value : scaleData(formattedRow, maxes, mins, "FT_PCT"), attrValue : (formattedRow["FT_PCT"] * 100).toFixed(2) + "%"},
            {axis : "3-Pointer Percentage", value : scaleData(formattedRow, maxes, mins, "FG3_PCT"), attrValue : (formattedRow["FG3_PCT"] * 100).toFixed(2) + "%"}
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

        var chartContainer = d3.select('.radar-chart');
        
        // chart legend
        chartContainer.append("circle").attr("cx",30).attr("cy",290).attr("r", 6).style("fill", "rgb(31, 119, 180)")
        chartContainer.append("circle").attr("cx",30).attr("cy",310).attr("r", 6).style("fill", "rgb(255, 127, 14)")
        chartContainer.append("text").attr("x", 40).attr("y", 290).text("Pre-COVID Regular Season").style("font-size", "15px").attr("alignment-baseline","middle")
        chartContainer.append("text").attr("x", 40).attr("y", 310).text("Bubble Seeding Games").style("font-size", "15px").attr("alignment-baseline","middle")

        // move labels on the left side of the chart over
        d3.selectAll(".legend.left")
            .attr("x", function(d) {
                return parseFloat(d3.select(this)[0][0].attributes.x.nodeValue) - this.getComputedTextLength();
            })

        d3.selectAll(".legend.middle")
            .attr("x", function(d) {
                return parseFloat(d3.select(this)[0][0].attributes.x.nodeValue) - (this.getComputedTextLength() / 2);
            })
    });
