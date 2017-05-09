/* Player constructor (server) which is initated to store into the socket list of players */

var Player = function(id, name) {
    
    /* init() */
    /* set ids and name */
    this.id = id;
    this.name = name;
    this.hit = 0;
    this.highScore = 0;
    
    /* group name can only be one */
    this.group = "";

    /* set waiting state of the player within the room */
    this.waiting = false;

    /* banned from groups */
    this.bannedGroups = [];
};



/* hits configurations, used to get the player hits and storing the hit value into the 
instance */ 
Player.prototype.getHits = function() {
    if(this.hit){
        return this.hit
    } else{
        return 0;
    }
};
Player.prototype.setHits = function(hit_value) {
    this.hit = hit_value;
};
Player.prototype.emptyHits = function() {
    this.hit = null;
};


/*set player' highscore, if the highscore is at the instance higher than the player has made before
the value will change.*/
Player.prototype.highScoreSet = function(){
    if(this.hit > this.highScore)
        this.highScore = this.hit;

    /* for chaining purpose */
    return this;
};


/* groups configuration, the groups are always assigned to the player once they enter the game room.
once the player leaves the group associated with the player are to be removed.  */
Player.prototype.getGroup = function(){
    if(this.group){
        return this.group;
    } else{
        return ""
    }
}; 
Player.prototype.setGroup = function(group_name){
    this.group = group_name;
};
Player.prototype.emptyGroup = function(){
    this.group = null;
};


/* add groups for the banned */
Player.prototype.setBan = function(group_name){
    this.bannedGroups.push(group_name);
};
/* check if the user is banned */
Player.prototype.isPlayerBanned = function(group_name){
    return this.bannedGroups.indexOf(group_name) !== -1;
};


exports.Player = Player;