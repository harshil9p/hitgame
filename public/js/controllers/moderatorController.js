"use strict";

angular.module("hitgame").controller("moderatorController", function($scope, toaster, $timeout, socket, $interval){

	/* main initialization */

	var moderator = {};


	/* connection established sd */
	socket.on('connect', function(){	
		console.log("welcome");
	});

	// Initial config
	socket.emit('createmoderator', createModerator());
	socket.emit('grouplist');


	// on actions
	socket.on('grouplistdata', groupList);
	socket.on('updatedgroups', groupList);
	socket.on('userdetails', userDetails);
	socket.on('leaderboardsdetails', updateLeaderBoards);

	// error from the server
	socket.on('errorfromserver', errorToaster);

	/* create the player 
	*/
	function createModerator(){
		$scope.moderatorname = prompt("what is your name?");
		if($scope.moderatorname === null || $scope.moderatorname === undefined || $scope.moderatorname.trim() === ''){
			$scope.moderatorname = "moderator " + randomNameNumberGenerator(1,1000);
		}
		moderator = new Moderator(getRandomId(), $scope.moderatorname);
		return { name: moderator.name }
	}
	

	/* list of all the groups 
	*/
	function groupList(data){
		$timeout(function(){
			$scope.groups = data;
		});	
	}

	/* user details 
	*/
	function userDetails(data){
		$timeout(function(){
			$scope.userList = data.userlist;
			console.log($scope.userList)
		})
	}

	/* leaderboards getter 
	*/
	function updateLeaderBoards(data){
		console.log(data, " data")
		$scope.final_leaderboards = data;
		$scope.$apply();
	}


	/* Actions from the dom
		list of functions called from the DOM
		create groups 
	*/
	$scope.createGroup = function(value){
		$scope.groupname = '';
		socket.emit('creategroup', value);
		socket.emit('grouplist');
	}


	/* join and start game 
	*/
	$scope.roomInformation = function(groupname){
		$scope.groupinstance = groupname;
		$scope.userList = [];
		// $scope.$apply();
		socket.emit('groupinformation', {groupname:groupname});
	}


	/* kick user 
	*/
	$scope.kick = function(user, banned){
		socket.emit('kickuser', {user:user, group:$scope.groupinstance, banned:banned});
	}

	/* get the leaderboards 
	*/
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