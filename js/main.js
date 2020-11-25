// Data Preprocessing 
var precovid_data, bubble_data;
var team_names = new Set();

var preprocessData = function(data, addTeams) {
    var headers = data.resultSets[0].headers;
    var dataRows = data.resultSets[0].rowSet;

    dataRows = dataRows.map((row) => {
        var formattedRow = {};
        for (var attr=0; attr < row.length; attr++) {
            formattedRow[headers[attr]] = row[attr];
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
    return dataRows;
}

d3.json("../data/precovid_team_data.json", function(data) {
    precovid_data = preprocessData(data, false);
});

d3.json("../data/bubble_team_data.json", function(data) {
    bubble_data = preprocessData(data, true);
});