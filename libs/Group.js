
/* group related changes */
var Group = function(){


	/* init() */
	var groups_ = ['firstone A', 'secondone B', 'thirdone C'];
	var ongoing_session = [];
	

	/* get the ongoing groups */
	this.add = function(value){
		groups_.push(value);
	}

	this.getAllGroups = function(){
		return groups_;
	}

	this.groupContains = function(group){
		return groups_.indexOf(group);
	}

	/* ongoing push */
	this.addOngoing = function(value){
		ongoing_session.push(value);
	}

	/* return ongoing */
	this.removeOngoing = function(value){
		ongoing_session = uniqueArray(ongoing_session);
        if(ongoing_session.indexOf(value) !== -1)
            ongoing_session.splice(ongoing_session.indexOf(value), 1);
	}


	/* this group is in ongoing sessions */
	this.isOngoing = function(group){
		if(ongoing_session.indexOf(group) === -1)
			return false;
		return true;
	}

	function uniqueArray(value){
		return uniqueValue = value.filter(function(item, pos) {
            return value.indexOf(item) == pos;
        })
	} 
}

exports.Group = Group;