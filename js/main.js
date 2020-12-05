// Data Preprocessing 
var precovid_data, bubble_data, playoff_data;
var precovid_plyr_data, bubble_plyr_data, playoff_plyr_data;
var team_names = new Set();
var maxes = {},mins = {};
var teamsLoaded = false;

// Scale the data so each value will be in a range of [0, 1]
var scaleData = function(data, maxes, mins, attr) {
    return (data[attr] / maxes[attr]); //+ (mins[attr] * 0.8);
}

// hide the polygon with the given number
var disablePolygon = function(number) {
    d3.selectAll(".area.radar-chart-serie" + number)
        .style("visibility", "hidden");

    d3.selectAll(".circle.radar-chart-serie" + number)
        .style("visibility", "hidden");
}

// display the polygon with the given number
var enablePolygon = function(number) {
    d3.selectAll(".area.radar-chart-serie" + number)
        .style("visibility", "visible");
    
    d3.selectAll(".circle.radar-chart-serie" + number)
        .style("visibility", "visible");
}

// take the raw json data and format it properly for the radar chart and table 
var preprocessData = function(data, addTeams, appendName, player = false) {
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
    
    if (addTeams && !teamsLoaded) {
        teamsLoaded = true;
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
        structuredData.className = !player ? formattedRow["TEAM_NAME"] + appendName : formattedRow["PLAYER_NAME"];

        // if the data is team data 
        if (!player) {
            structuredData.axes = [
                {axis : "Win %", value : scaleData(formattedRow, maxes, mins, "W_PCT"), attrValue : (formattedRow["W_PCT"] * 100).toFixed(2) + "%"},
                {axis : "Rebounds", value : scaleData(formattedRow, maxes, mins, "REB"), attrValue : formattedRow["REB"]},
                {axis : "Assists", value : scaleData(formattedRow, maxes, mins, "AST"), attrValue : formattedRow["AST"]},
                {axis : "Steals", value : scaleData(formattedRow, maxes, mins, "STL"), attrValue : formattedRow["STL"]},
                {axis : "Blocks", value : scaleData(formattedRow, maxes, mins, "BLK"), attrValue : formattedRow["BLK"]},
                {axis : "Field Goal %", value : scaleData(formattedRow, maxes, mins, "FG_PCT"), attrValue : (formattedRow["FG_PCT"] * 100).toFixed(2) + "%"},
                {axis : "Free Throw %", value : scaleData(formattedRow, maxes, mins, "FT_PCT"), attrValue : (formattedRow["FT_PCT"] * 100).toFixed(2) + "%"},
                {axis : "3-Pointer %", value : scaleData(formattedRow, maxes, mins, "FG3_PCT"), attrValue : (formattedRow["FG3_PCT"] * 100).toFixed(2) + "%"}
            ];
            structuredData.gp = formattedRow["GP"];
        // if it is individual player data
        } else {
            structuredData.axes = 
                {"W_PCT" : formattedRow["W_PCT"],
                "REB" : formattedRow["REB"],
                "AST" : formattedRow["AST"],
                "STL" : formattedRow["STL"],
                "BLK" : formattedRow["BLK"],
                "FG_PCT" : formattedRow["FG_PCT"],
                "FT_PCT" : formattedRow["FT_PCT"],
                "FG3_PCT" : formattedRow["FG3_PCT"],
                "TEAM_ABBRV": formattedRow["TEAM_ABBREVIATION"],
                "PTS" : formattedRow["PTS"]
                };
        } 

        return structuredData;
    });

    return dataRows;
}

// Processing of each the the data files retrieve from https://www.nba.com/stats/
// Team data
d3.json("../data/precovid_team_data.json", function(data) {
    precovid_data = preprocessData(data, false, " (Pre-COVID)");
});

d3.json("../data/bubble_team_data.json", function(data) {
    bubble_data = preprocessData(data, true, " (Bubble)");
});

d3.json("../data/playoffs_team_data.json", function(data) {
    playoff_data = preprocessData(data,true, " (Playoffs)");
})

// Individual Player data
d3.json("../data/precovid_player_data.json", function(data) {
    precovid_plyr_data = preprocessData(data, false, "", true);
})

d3.json("../data/bubble_player_data.json", function(data) {
    bubble_plyr_data = preprocessData(data, false, "", true);
})

d3.json("../data/playoffs_player_data.json", function(data) {
    playoff_plyr_data = preprocessData(data, false, "", true);
})

// on team selection generate the two charts
d3.select(document.getElementById('go'))
    .style("border", "1px solid black")
    .on('click', function() {
        data = precovid_data.concat(bubble_data).concat(playoff_data);

        // filter the data to get the right teams
        results = data.filter(data => {
            return (data.className === document.getElementById("teams").value + " (Pre-COVID)") || 
                (data.className === document.getElementById("teams").value + " (Bubble)") || 
                (data.className === document.getElementById("teams").value + " (Playoffs)");
        })
        // draw the radar chart using the RadartChart object in radar-chart.js
        RadarChart.draw(".chart-container", results);

        var chartContainer = d3.select('.radar-chart');
        
        // chart legend
        var legend_y = 560; // y-value of the legends placement
        chartContainer.append("circle").attr("cx",30).attr("cy",legend_y).attr("r", 6).style("fill", "rgb(31, 119, 180)")
        chartContainer.append("circle").attr("cx",30).attr("cy",legend_y + 20).attr("r", 6).style("fill", "rgb(255, 127, 14)")
        chartContainer.append("circle").attr("cx",30).attr("cy",legend_y + 40).attr("r", 6).style("fill", "rgb(44, 160, 44)")
        chartContainer.append("text")
            .attr("x", 40)
            .attr("y", legend_y)
            .text("Pre-COVID Regular Season (" + results[0].gp + " games)")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")
            .attr("vis", "on")
            .on("click", function(d){ // on click hide or display the corresponding polygon
                if (d3.select(this).attr("vis") === "on") {
                    disablePolygon("0");
                    d3.select(this).attr("vis", "off");
                    d3.select(this).style("fill", "rgb(155, 155, 155)")
                } else {
                    enablePolygon("0");
                    d3.select(this).attr("vis", "on");
                    d3.select(this).style("fill", "rgb(0, 0, 0)")
                }
            })
            .on("mouseover", function(d) {
                d3.select(this).style("fill", "rgb(155,155,155)")
            })
            .on("mouseout", function(d) {
                if (d3.select(this).attr("vis") === "on") {
                    d3.select(this).style("fill", "rgb(0,0,0)");
                } else {
                    d3.select(this).style("fill", "rgb(155, 155, 155)")
                }
            })
        chartContainer.append("text")
            .attr("x", 40)
            .attr("y", legend_y + 20)
            .text("Bubble Seeding Games (" + results[1].gp + " games)")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")
            .attr("vis", "on")
            .on("click", function(d){
                if (d3.select(this).attr("vis") === "on") {
                    disablePolygon("1");
                    d3.select(this).attr("vis", "off");
                    d3.select(this).style("fill", "rgb(155, 155, 155)")
                } else {
                    enablePolygon("1");
                    d3.select(this).attr("vis", "on");
                    d3.select(this).style("fill", "rgb(0, 0, 0)")
                }
            })
            .on("mouseover", function(d) {
                d3.select(this).style("fill", "rgb(155,155,155)")
            })
            .on("mouseout", function(d) {
                if (d3.select(this).attr("vis") === "on") {
                    d3.select(this).style("fill", "rgb(0,0,0)");
                } else {
                    d3.select(this).style("fill", "rgb(155, 155, 155)")
                }
            })
            
        chartContainer.append("text")
            .attr("x", 40)
            .attr("y", legend_y + 40)
            .text((results[2]) ? "Playoff Games  (" + results[2].gp + " games)" : "Playoff Games  (0 games)")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")
            .attr("class", "legendText")
            .attr("vis", "on")
            .on("click", function(d){
                if (d3.select(this).attr("vis") === "on") {
                    disablePolygon("2");
                    d3.select(this).attr("vis", "off");
                    d3.select(this).style("fill", "rgb(155, 155, 155)")
                } else {
                    enablePolygon("2");
                    d3.select(this).attr("vis", "on");
                    d3.select(this).style("fill", "rgb(0, 0, 0)")
                }
            })
            .on("mouseover", function(d) {
                d3.select(this).style("fill", "rgb(155,155,155)")
            })
            .on("mouseout", function(d) {
                if (d3.select(this).attr("vis") === "on") {
                    d3.select(this).style("fill", "rgb(0,0,0)");
                } else {
                    d3.select(this).style("fill", "rgb(155, 155, 155)")
                }
            })


        // move labels on the left side of the radar chart over
        d3.selectAll(".legend.left")
            .attr("x", function(d) {
                return parseFloat(d3.select(this)[0][0].attributes.x.nodeValue) - this.getComputedTextLength();
            })

        d3.selectAll(".legend.middle")
            .attr("x", function(d) {
                return parseFloat(d3.select(this)[0][0].attributes.x.nodeValue) - (this.getComputedTextLength() / 2);
            })

        //display individual player stats
        // html element for the individual player dropdown
        var selection = `<div style='display: inline'>
            <label for='bubble-part'>NBA Regular Season vs.</label>
            <select name='bubble-part' id='bubble-part'>
            <option value="seed">Seeding Games</option>
            <option value="playoff">Playoff Games</option>
            </select>
            <button class='go-player' style="margin-top: 10px;">GO</button><div>`;

        // generate the individual player stats using function defined in player-stats.js
        generatePlayerGrid(getTeamPlayers(document.getElementById("teams").value, precovid_plyr_data),
            getTeamPlayers(document.getElementById("teams").value, bubble_plyr_data), 
            ".player-grid", selection);
    });
