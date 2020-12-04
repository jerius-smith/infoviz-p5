/* The purpose of this file is to create and display the individual
 * player stats in a table.
 * 
 */


var team_name_dict;

// Define the arrows to indicate player performance
// Each in a function that takes in a color and return a svg
var downArrow = function(color) { return `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down-circle" fill="`+ color +`" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z "/>
</svg>`};
var upArrow = function(color) { return `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up-circle"  fill="`+ color +`" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
</svg>`};
var noArrow = function(color) { return `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-dash-circle" fill="`+ color +`"  xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
</svg>`};

// Store a dictionary of team names and their abbreviations for filtering
d3.json("../data/team_name_abbrev.json", function(data) {
    team_name_dict = data;
});

//position scale
var xScale = d3.scale.linear().domain([-1, 1]).range([0, 250])

//The mystical polylinear color scale 
var colorScale = d3.scale.linear().domain([-1, 0, 1])
    .range(["red", "gold", "green"])

// create the player stat table
// takes in a base dataset and one to compare to
var generatePlayerGrid = function(data1, data2, id, selection) {
    //clear previous table
    document.getElementsByClassName("player-grid-header")[0].innerHTML = "";
    document.getElementsByClassName("player-grid-footer")[0].innerHTML = selection;
    document.getElementsByClassName("player-grid")[0].innerHTML = "";

    var chart = d3.select(id)
                    .datum(data);

    data1.sort((player1, player2)=> {
        return player2.axes["PTS"] - player1.axes["PTS"] ; // sort by highest scorers
    });

    var header = d3.select(".player-grid-header")

    // create table header
    var row = header.append("div") 
            .attr('class', 'row');
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("Name");
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("Field Goal %");

    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("Rebounds");
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("Assists");
    
    row.append('div')
            .attr('class', 'column')
            .append('p')
            .text("Blocks");
    
    var attrs = ["FG_PCT", "REB", "AST", "BLK"];
    // create row for each player
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
                        data2.filter(plyr => player.className === plyr.className)[0], attr)); // retrieve the right arrow based on the stats
            })
        }
        
    })

    //legend
    var vis = d3.select(".player-grid-footer").append('svg');

    var arr = d3.range(-1, 1, 0.01)
    vis.style("width", "300px")
        .style("height", "60px");

    vis.selectAll('rect').data(arr).enter()
        .append('rect')
        .attr({
            x : function(d) { return xScale(d) + 20},
            y : 20,
            height: 20,
            width: 5,
            fill: function(d) { return colorScale(d) }
        })
    
    vis.append("text")
        .attr({
            x : 0,
            y : 50,
        })
        .text("-100%")
        .style("font-size", "x-small")
    
    vis.append("text")
        .attr({
            x : 260,
            y : 50,
        })
        .text("+100%")
        .style("font-size", "x-small")

    d3.select(".player-grid-footer").append("p")
        .attr({
            x : 0,
            y : 70,
        })
        .text("*** Player are ordered by the highest scorers in the regular season prior to NBA shutdown ***")
        .style("font-size", "xx-small")
        .style("overflow-wrap", "normal")

    // change the filter of the player table "seeding games" or "playoffs"
    d3.select(".go-player")
        .on("click", function(d) {
            if (document.getElementById("bubble-part").value === "seed") {
                selection = `<label for='bubble-part'>NBA Regular Season vs.</label>
                    <select name="teams" id='bubble-part' id="teams" style="display: block; margin: auto;">
                    <option value="seed">Seeding Games</option>
                    <option value="playoff">Playoff Games</option>
                    </select>
                    <button class='go-player' style="display: block; margin: auto; margin-top: 10px;">GO</button>`;
                generatePlayerGrid(getTeamPlayers(document.getElementById("teams").value, precovid_plyr_data),
                    getTeamPlayers(document.getElementById("teams").value, bubble_plyr_data), 
                    ".player-grid", selection);
            } else {
                selection = `<label for='bubble-part'>NBA Regular Season vs.</label>
                    <select name="teams" id='bubble-part' id="teams" style="display: block; margin: auto;">
                    <option value="playoff">Playoff Games</option>
                    <option value="seed">Seeding Games</option>
                    </select>
                    <button class='go-player' style="display: block; margin: auto; margin-top: 10px;">GO</button>`;
                generatePlayerGrid(getTeamPlayers(document.getElementById("teams").value, precovid_plyr_data),
                    getTeamPlayers(document.getElementById("teams").value, playoff_plyr_data), 
                    ".player-grid", selection);
            }
        })
}

// returns all the players of a given team
var getTeamPlayers = function(name, players) {
    return players.filter( player => {
        return player.axes["TEAM_ABBRV"] == team_name_dict[name];
    });
}

// get the right arrow and color
var getArrow = function(data1, data2, attr) {
    if (data2) {
        if (data1.axes[attr] < data2.axes[attr]) {
            return upArrow(getColor(data1.axes[attr], data2.axes[attr]));
        } else if (data1.axes[attr] == data2.axes[attr]) {
            return noArrow(getColor(data1.axes[attr], data2.axes[attr]));
        } else {
            return downArrow(getColor(data1.axes[attr], data2.axes[attr]));
        }
    }
}

// get the color based of the colorScale using percent change
var getColor = function(a, b) {
    return colorScale((b - a) / a);
}