
/* helper functions to help */

function getRandomId(){
	return Math.floor((1 + Math.random()) * 0x10000).toString(16)
      .substring(1);
}

function randomNameNumberGenerator(begin, end){
	var cool_alphabets_only = "ABCDEFGHIKLMNPQRSVWXYZ";
	var num = Math.floor(Math.random() * end) + begin;
	var char = cool_alphabets_only[Math.floor(Math.random() * cool_alphabets_only.length)]
    return num + char;
}