"use strict";

angular.module("hitgame").controller("mainController", function($scope,	socket, toaster, $timeout, $interval){

	/* main initialization */
	var TIMEINTERVAL = 15,
	 	player = {}



	/*  
		////////   LIST OF IMPORTANT SCOPES RELATED TO THE GAMEPLAY   ///////
		$scope = {
			begingame : 'when the player enters the group',
			gamestart : 'the game shall begin for running period i.e. 15 secs',
			gameend : 'when the game has ended',
			leaderboards : show the list of players score
			score : score,
			time : time,
		}
	 */
	$scope.groups = [];
	$scope.begingame = false;
	$scope.score = 0;
	$scope.text = "Start Game";



	/* on connection established */
	socket.on('connect', function(){	
		console.log("welcome");
	});
	
	socket.emit('createplayer', createPlayer());
	socket.emit('grouplist');
	socket.on('grouplistdata', groupList);
	socket.on('updatedgroups', groupList);
	socket.on('begingame', beginGame);
	socket.on('mayenter', mayEnter);
	socket.on('endgame', endGame);
	socket.on('removefromgroup', removeFromGroup);
	socket.on('leaderboardsdetails', updateLeaderBoards);

	/* error from the server */
	socket.on('errorfromserver', errorToaster);
 
	/* create the player */
	function createPlayer(){
		$scope.playername = prompt("what is your name?");
		if($scope.playername === null || $scope.playername === undefined || $scope.playername.trim() === ''){
			$scope.playername = "player " + randomNameNumberGenerator(1,1000);
		}
		player = new Player(getRandomId(), $scope.playername);
		return { name: player.name}
	}
	
	/* list of all the groups */
	function groupList(data){
		$timeout(function(){
			$scope.groups = data;
		});	
	}

	
	/* begin game */
	function beginGame(data){
		if(data.gamebegins === true){
			$timeout(function(){
				$scope.leaderboards = [];
				$scope.score = 0;
				$scope.gamestart = true;
				$scope.gameend = false;
				beginTimer(TIMEINTERVAL);
			})
		}
	}


	/* if the player may enter the room or not. */
	function mayEnter(data){
		if(data.enter){
			$timeout(function(){
				$scope.begingame = true;
				$scope.groupname_share = data.group;
			})
		}
	}


	/* game end */
	function endGame(data){
		var leaderboard = data.leaderboards;
		$timeout(function(){
			$scope.text = "Start Game";
			$scope.leaderboards = leaderboard;
			$scope.leaderboards.sort(function(a, b) {
			    return parseFloat(b.score) - parseFloat(a.score);
			});
			$scope.gameend = true;
			$scope.gamestart = false;
			player.setHits($scope.score);
		})
	}
		

	/* remove from the group */
	function removeFromGroup(data){
		$scope.leaveGroup();
		errorToaster(data);
	}


	/* game running */
	var beginTimeout;
	function beginTimer(data){
		var secs_ = data;

		/* only one instance of timeout working at a time hence, */
		clearInterval(beginTimeout);

		beginTimeout = setInterval(function(){
			secs_= secs_ - 1;
			$("#timer").text(secs_);
    		if(secs_ === 0){
				clearInterval(beginTimeout);
			}
		}, 1000)
	}

	/* leaderboards getter */
	function updateLeaderBoards(data){
		$timeout(function(){
			$scope.final_leaderboards = data;
		})
	}



	/* list of functions called from the DOM
				// create groups 
	*/
	$scope.createGroup = function(value){
		$scope.groupname = '';
		socket.emit('creategroup', value);
		socket.emit('grouplist');
	}


	/* join and start game */
	$scope.joinAndStart = function(groupname){
		$scope.group_name = groupname;
		socket.emit('joingroupandstart', {groupname:groupname});
	}

	/* funally begin the game */
	$scope.startGame = function(){
		socket.emit('joingroupandstart', {groupname:$scope.groupname_share, waiting:true});
		$scope.text = "Waiting for other players";
	}

	/* leave group */
	$scope.leaveGroup = function(selectedgroup){
		socket.emit('leavegroup', {});

		/* update leaderboard score 
		*/
		if($scope.hidethis){
			$scope.getLeaderboards();
		}
		$timeout(function(){
			$scope.text = "Start Game";
			$scope.begingame = false;
			$scope.gamestart = false;
			$scope.gameend = false;
			$scope.leaderboard = [];
		})
	}

	/* update score */
	$scope.updateScore = function(){
	    $scope.score++;
		socket.emit('updatescore', {score:$scope.score});
	}

	/* get the leaderboards */
	$scope.getLeaderboards = function(){
		socket.emit('getleaderboards');
	}

	
	/* HELPER FUNCTIONS
	for error showing */
	function errorToaster(data){
		$timeout(function(){
    		toaster.pop('error', data.title, data.text);
		})
    }

})