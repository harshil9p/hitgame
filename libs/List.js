/* basic cache mechanism */
/* memory for the players */

var fs = require("fs");
var leaderboards_read = require("../data_.json");


function List() {

    /* init() */
    var players_ = {};
    var leaderboards_ = leaderboards_read || [];
    var moderator_ = {};

    /* getter and setter for the players */
    this.getPlayerByID = function(id) {
        return players_[id] || false;
    }
    this.setPlayers = function(value) {
        players_[value.id] = value
    }


    /* get list of all the players */
    this.getAllPlayers = function() {
        return players_;
    }

    /* remove the player from the memory */
    this.removePlayer = function(id) {
        delete players_[id];
    }

    /* check for the players in lobby */
    this.checkForWaitingInGroup = function(group) {
        for (var key in players_) {
            if (players_.hasOwnProperty(key)) {
                if (players_[key]['group'] === group && players_[key]['waiting'] === false) {
                    return false;
                }
            }
        }
        return true;
    }


    /* update leaderboards */
    this.setLeaderBoard = function(player) {
        var score = player.score;
        delete player.id;
        /* bare minimum to be 1 if score is to be added to the leaderboards */
        if (score < 1)
            return false;

        /* if leaderboards was empty */
        if (!leaderboards_.length) {
            leaderboards_.push(player);
        } else {
            /* now  */
            /* sort leaderboards */
            this.sortLeaderBoards();
            if (leaderboards_[0].score < score || leaderboards_.length < 10) {
                leaderboards_.push(player);
            }
        }
        /* sort leaderboards */
        this.sortLeaderBoards();

        if (leaderboards_.length > 10) {
            leaderboards_.length = 10;
        }
        /* sort leaderboards */
        this.sortLeaderBoards();
        fs.writeFile("data_.json", JSON.stringify(leaderboards_), "utf8" );
    }

    this.sortLeaderBoards = function() {
        leaderboards_.sort(function(a, b) {
            return a.score < b.score;
        });
    }


    /* get the leaderboards */
    this.getLeaderBoard = function() {
        return leaderboards_;
    }

    /* empty out the leaderboards */
    this.emptyLeaderBoards = function() {
        leaderboards_ = [];
    }


    /* set moderator */
    this.setModerator = function(value) {
        moderator_[value.id] = value;
    }



    /* once the game begins the players are removed from the waiting */
    this.removeWaitingFromGroup = function(group) {
        for (var key in players_) {
            if (players_.hasOwnProperty(key)) {
                if (players_[key]['group'] === group) {
                    players_[key]['waiting'] = false;
                    console.log(players_);
                }
            }
        }
    }
}

exports.List = List;
