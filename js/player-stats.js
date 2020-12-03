var team_name_dict;
var downArrow = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/>
</svg>`;
var upArrow =  `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
</svg>`;
var noArrow = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-dash-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
</svg>`;

d3.json("../data/team_name_abbrev.json", function(data) {
    team_name_dict = data;
});


var generatePlayerGrid = function(data1, data2, id) {
    //clear previous table
    document.getElementsByClassName("player-grid-header")[0].innerHTML = "";
    document.getElementsByClassName("player-grid")[0].innerHTML = "";

    var chart = d3.select(id)
                    .datum(data);

    data1.sort((player1, player2)=> {
        return player2.axes["PTS"] - player1.axes["PTS"] ; // sort by highest scores
    });

    var header = d3.select(".player-grid-header")

    var row = header.append("div") 
            .attr('class', 'row');
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("name");
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("field goal %");

    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("rebounds");
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("assists");
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("blocks");
    
    var attrs = ["FG_PCT", "REB", "AST", "BLK"];
    data1.forEach(player => {
        if (data2.filter(plyr => player.className === plyr.className).length > 0) {
            var row = chart.append("div") 
                .attr('class', 'row')
            
            row.append('div')
                .attr('class', 'column')
                .append('p')
                .text(player.className);

            attrs.forEach(attr => {
                row.append('div')
                    .attr('class', 'column')
                    .append('g')
                    .html(getArrow(player, 
                        data2.filter(plyr => player.className === plyr.className)[0], attr));
            })
        }
        
    })
}

var getTeamPlayers = function(name, players) {
    return players.filter( player => {
        return player.axes["TEAM_ABBRV"] == team_name_dict[name];
    });
}

var getArrow = function(data1, data2, attr) {
    if (data2) {
        console.log(data1.className, data1.axes[attr] , data2.axes[attr])
        if (data1.axes[attr] < data2.axes[attr]) {
            return upArrow;
        } else if (data1.axes[attr] == data2.axes[attr]) {
            return noArrow;
        } else {
            return downArrow;
        }
    }
}