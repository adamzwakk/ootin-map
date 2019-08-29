const fs = require('fs');
const _ = require('underscore');

var places = JSON.parse(fs.readFileSync('./data/places.json','utf8'));
var entrances = JSON.parse(fs.readFileSync('./data/entrances.json','utf8'));

let missingCount = 0;
_.each(entrances,function(e){
	let from = e.from;
	let to = e.to;

	if(typeof _.findWhere(entrances,{to:from,from:to}) === 'undefined'){
		if(typeof e.nick !== 'undefined'){
			let name = e.nick.split(' -> ')
			console.log(name[1]+' -> '+name[0]+' (nickname)');
		} else {
			console.log(
				_.findWhere(places,{id:to}).name+' -> '+_.findWhere(places,{id:from}).name
			)
		}
		missingCount++;
		//console.log('Missing! '+JSON.stringify(e));
	}
});

console.log('Found '+missingCount+' missing entrances');