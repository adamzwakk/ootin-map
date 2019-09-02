const express = require('express')
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const app = express()
const port = 4000
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')
app.use(fileUpload());

console.log("Starting up OOTin Map!")
var places = JSON.parse(fs.readFileSync('./data/places.json','utf8'));
console.log('Found '+places.length+' places');
var entrances = JSON.parse(fs.readFileSync('./data/entrances.json','utf8'));
entrances = parseEntrances(entrances,places);
console.log('Parsed '+entrances.length+' entrances');
var items = JSON.parse(fs.readFileSync('./data/items.json','utf8'));
console.log('Found '+items.length+' items');

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
	return res.render('index',{
		places:places,
		entrances:entrances,
		items:items
	});
});

app.post('/spoiler-upload', (req, res) => {
	var spoilers = JSON.parse(req.files.file.data.toString('utf8'));
	if(typeof spoilers.entrances === 'undefined'){
		res.end(JSON.stringify({"error":"No Entrances Found"}));
	}
	let spoilers_e = spoilers.entrances;

	let spoilers_result = [];
	_.each(spoilers_e,function(d,e){
		let source = _.findWhere(entrances,{nick:e});

		let dest = {};
		if(typeof d === 'object'){
			dest = _.findWhere(entrances,{nick:d.from+' -> '+d.region});
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
			if(typeof source.required_items !== 'undefined'){
				ob.required_items = source.required_items
			}
			spoilers_result.push(ob);
		} else {
			let did = 0;
			dest = _.findWhere(places,{name:d});
			if(typeof dest === 'undefined'){
				dest = _.findWhere(entrances,{to_name:d})
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
	
	res.setHeader('Content-Type', 'application/json');
	return res.end(JSON.stringify({
		seed:spoilers[':seed'],
		entrances:spoilers_result
	}));
});

app.listen(port,'0.0.0.0')
console.log('Ready!');