const express = require('express')
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const app = express()
const port = 4000
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')

console.log("Starting up OOTin Map!")

function parseEntrances(entrances,places){
	let sorted_e = [];
	_.each(entrances,function(e){
		if(typeof e.nick !== 'undefined'){
			let nick = e.nick.split(' -> ');
			e.from_name = nick[0];
			e.to_name = nick[1];
		} else {
			e.from_name = _.findWhere(places,{id:e.from}).name;
			e.to_name = _.findWhere(places,{id:e.to}).name;
			e.nick = e.from_name+' -> '+e.to_name;
		}

		sorted_e.push(e)
	});

	return sorted_e;
}


app.get('/', (req, res) => {
	var places = JSON.parse(fs.readFileSync('./data/places.json','utf8'));
	var entrances = JSON.parse(fs.readFileSync('./data/entrances.json','utf8'));
	
	return res.render('index',{
		places:places,
		entrances:parseEntrances(entrances,places)
	});
});

app.get('/spoiler-test', (req, res) => {
	var places = JSON.parse(fs.readFileSync('./data/places.json','utf8'));
	var entrances = JSON.parse(fs.readFileSync('./data/entrances.json','utf8'));

	let sorted_e = parseEntrances(entrances,places);

	var spoilers = JSON.parse(fs.readFileSync('./data/examples/spoilers.json','utf8'));
	let spoilers_e = spoilers.entrances;

	let spoilers_result = [];
	_.each(spoilers_e,function(d,e){
		let source = _.findWhere(sorted_e,{nick:e});

		let dest = {};
		if(typeof d === 'object'){
			dest = _.findWhere(sorted_e,{nick:d.from+' -> '+d.region});
			let ob = {
				from_name:source.nick,
				to_name:dest.nick,
				from:source.from,
				to:dest.to,
				lat:source.lat,
				lng:source.lng
			};
			if(typeof source.oneway !== 'undefined'){
				ob.oneway = true;
				ob.extra_to = {
					"lat":dest.lat,
					"lng":dest.lng
				}
			}
			spoilers_result.push(ob);
		} else {
			let did = 0;
			dest = _.findWhere(places,{name:d});
			if(typeof dest === 'undefined'){
				dest = _.findWhere(sorted_e,{to_name:d})
				did = dest.to;
			} else {
				did = dest.id;
			}

			spoilers_result.push({
				from:source.from,
				to:did,
				lat:source.lat,
				lng:source.lng
			});

			var destE = _.findWhere(entrances,{from:did});
			if(typeof destE !== 'undefined'){
				spoilers_result.push({
					from:did,
					to:source.from,
					lat:destE.lat,
					lng:destE.lng
				});
			} else {
				//console.log(dest);
			}
		}
	});
	
	return res.render('index',{
		places:places,
		entrances:spoilers_result,
	});
});

app.listen(port,'0.0.0.0')