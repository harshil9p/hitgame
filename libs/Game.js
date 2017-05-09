
/* game begin using socket */
var Game = function(server){

    /* private declarations */
    var Player = require("./Player").Player,
        Moderator = require("./Moderator").Moderator,
        List = require("./List").List,
        Group = require('./Group').Group,
        cron = require('node-schedule'),
        io = require('socket.io');


    /* init() */

    this.serverdata = server
    var socketConnector = null, 
        rooms = null;


    /* initiate playerlist & group */
    var list_ = new List(),
        group_ = new Group();


    /* main connection happens here */
    this.startGameEngine = function(){
        
        /* listen to the server */
        this.io = io.listen(this.serverdata);
        socketConnector = this.io.sockets;

        /*  GROUPS v/s ROOMS
                groups are entities within constructors and functions, 
                rooms are the socket.io property rooms 
        */

        rooms = this.io.sockets.adapter.rooms;
        /* the connection established */
        socketConnector.on('connection', function(client) {
            /* player interactions with the socket */
            client.on('createplayer', createPlayer);
            client.on('creategroup', createGroup);
            client.on('grouplist', groupList);
            client.on('leavegroup', leaveGroup);
            client.on('joingroupandstart', joinAndStartGame);
            client.on('updatescore', updateUserScore);
            client.on('getleaderboards', getLeaderBoards);
            client.on('disconnect', endPlayer);

            /* moderator interactions */
            client.on('createmoderator', createModerator);
            client.on('groupinformation', groupInformation);
            client.on('kickuser', kickUser);
            client.on('clientleave', clientLeave);
        });
    }


    /* create player */
    function createPlayer(data){
        if(data.name || data.id){
            var name = data.name || "player " + randomNumberGenerator(1,100); 
            /* instantiating the player and storing it into the players library along with the 
            related methods */
            var player = new Player(this.id, name);
            /* storing the player */
            list_.setPlayers(player);
        }
    }


    /* create the grouplist */
    function createGroup(name){
        if(name.trim() === ""){
            errorToClient('Oops!','group name cannot be empty', this);
        } else if(group_.groupContains(name) > -1){
            errorToClient('Oops!','group name already exists', this);
        } else{
            group_.add(name);
            socketConnector.emit('updatedgroups', {groups:group_.getAllGroups()});
        }
    }


    /* send the info of the groups */
    function groupList(client){
        this.emit('grouplistdata',{groups:group_.getAllGroups()});        
    }


    /* events on exit */
    function leaveGroup(data){
        var player = list_.getPlayerByID(this.id);
        
        if(player){
            var playerGroup = player.getGroup();
            this.leave(playerGroup); /* leave group */
            if(rooms[playerGroup] === undefined){
                group_.removeOngoing(playerGroup);
            }
            player.emptyGroup(); /* erase group from the player */
            lobbyCheck(playerGroup); /* if the user left was the one making other players wait */
            player.waiting = false; /* player is no more waiting */
        }
    }


    /* join the group and begin the game */
    function joinAndStartGame(data){
        var player = list_.getPlayerByID(this.id);
        /*  */ 
        if(!player)
            return false;
        if(player.isPlayerBanned(data.groupname)){
            errorToClient('Oops!', 'You have been banned from this group', this);
            return false;
        }

        var group = data.groupname;

        /* create room for the player's to join or join the existing room 
        */
        this.join(group);

        /* make sure the room is not filled or the room doesn't have players already playing games in it
         */
        if(group_.isOngoing(group) === false && rooms[group].length <= globals['MAXPLAYERS']){
        
            /* enter the games in waiting */
            if(data.waiting)
                player.waiting = true; 

            /* player can enter the gaming section */
            socketConnector.in(group).emit('mayenter', {enter:true, group:group});
            player.setGroup(group);


            if(rooms[group].length >= globals['MINPLAYERS']){

                /* this function checks if all the players in the lobby are ready to play. If all
                the players are ready, then the game begins. */
                lobbyCheck(group);
            }
        } 


        /* if the room is filled, then the player shall not enter the gaming section */
        else{
            this.leave(group);
            errorToClient('Oops!', 'Room already filled', this);
        }
    }
    
   
    /* update score */
    function updateUserScore(data){
        var player = list_.getPlayerByID(this.id);
        if(player){
            player.setHits(data.score); /* update user score */
        } 
    }


    /* when the player exits */
    function endPlayer(data){
        var player = list_.getPlayerByID(this.id) /* get player */
        if(player){
            var group = player.getGroup(); /* get group for checking */
            list_.removePlayer(this.id); /* remove player */
            lobbyCheck(group); /* remove player */
        }
    }

    /* 
        HELPER FUNCTIONS
    */
    
    
    /* if all the waiting players are ready, then the game will begin */
    function lobbyCheck(group){
        var begingame = checkForRoom(group);

        /* the game may begin now */
        if(begingame){
            /* the group is pushed into busy mode  */
            group_.addOngoing(group);
            /* the game shall begin */
            socketConnector.in(group).emit('begingame', {gamebegins:true});
            /* remove player from waiting */
            list_.removeWaitingFromGroup(group);
            /* the countdown till the game ends. */
            countDown(group);
        }
    }

    /* check for waiting room */
    function checkForRoom(group){
        /* check if the room is empty and then notify the player */

        if(!rooms[group])
            return false;
        if(rooms[group].length < globals['MINPLAYERS'])
            return false;
        return list_.checkForWaitingInGroup(group); /* check the state of the user waiting in the group */
    }


    function getLeaderBoards(){
        socketConnector.connected[this.id].emit('leaderboardsdetails', {leaderboards:list_.getLeaderBoard()});
    }

    /* interval calculations */
    function countDown(room){
        var secs_ = globals['TIMEOUT'];
        var interval = setInterval(function(){
            // socketConnector.in(room).emit('timeremaining', {timeremaining:secs_}); 
            secs_--;
            /* timer over */
            if(secs_ < 0){
                var session_leaderboards = [];
                if(rooms[room]){
                    /* way to collect the leaderboards */
                    for(var client in rooms[room].sockets){
                        var temp_ = {};
                        var player = list_.getPlayerByID(client);
                        if(player){
                            temp_['name'] = player.name;
                            temp_['score'] = player.getHits() || 0;
                            player.highScoreSet().emptyHits();
                            session_leaderboards.push(temp_);
                            /* add to the leaderboards if score is proper */
                            list_.setLeaderBoard(temp_);
                        }
                    }
                }

                /* the ongoing groups are the groups that are to be emptied when there are 
                no more players playing in that group. */
                group_.removeOngoing(room)
                // ongoing.splice(ongoing.indexOf(room), 1);
                clearTimeout(interval);
                socketConnector.in(room).emit('endgame', {leaderboards:session_leaderboards}); 
            }
        }, globals['INTERVAL']);

    }



    /* moderator interactions */
    /* create moderator */
    function createModerator(data){
        if(data.name || data.id){
            var name = data.name || "moderator " + randomNumberGenerator(1,100); 
            /* instantiating the player and storing it into the players library along with the 
            related methods */
            var moderator = new Moderator(this.id, name);
            /* storing the player */
            list_.setModerator(moderator);
        }
    }



    function groupInformation(data){
        if(rooms[data.groupname]){
            var userList = [];
            for(client in rooms[data.groupname].sockets){
                var player = list_.getPlayerByID(client)
                if(player)
                    userList.push(player)
            }
            socketConnector.connected[this.id].emit('userdetails', {userlist:userList});
        } else {
            errorToClient('Oops!', 'The room is empty', this);
        }
    }



    /* kick the user out */
    function kickUser(data){
        var player = list_.getPlayerByID(data.user['id']);
        var group = data.group;
        if(player){
            if(rooms[group] && player.getGroup() === group){
                var room_find = rooms[group].sockets[player.id];
                socketConnector.connected[player.id].emit('leaveroom');
                removeFromGroup('Oops', 'You have been removed from the server', data.user);
            } else{
                errorToClient("oops", "The user has left the room or no longer exists!", this)
            }
            if(data.banned)
                player.setBan(group);
        } else{
            errorToClient("oops", "seems like player is no more there!", this)
        }
    }


    function clientLeave(data){
        console.log('ok');
        var player = list_.getPlayerByID(this.id);
        if(player){
            var group = player.getGroup();
            this.leave(group);
            lobbyCheck(group);
        }
    }


    /* when there is error */
    function errorToClient(title, text, client){
        socketConnector.connected[client.id].emit('errorfromserver', {title:title, text:text});
    }


    /* when user is to be removed from the group */
    function removeFromGroup(title, text, client){
        socketConnector.connected[client.id].emit('removefromgroup', {title:title, text:text});
    }


    /* extras */
    function randomNumberGenerator(begin, end){
        return Math.floor(Math.random() * end) + begin;
    }


    /* run cron to empty out the leaderboards on this connection */
    cron.scheduleJob({hour: 23, minute: 59, dayOfWeek:0 }, function(){
        list_.emptyLeaderBoards();
    });


}   


/* global constants */

var globals = {};

Object.defineProperties(globals, {
  'MINPLAYERS': {value: 2, writable: false },
  'MAXPLAYERS': {value: 5, writable: false },
  'TIMEOUT' : {value: 15, writable: false },
  'INTERVAL' : {value: 1000, writable: false }
});




module.exports = Game;