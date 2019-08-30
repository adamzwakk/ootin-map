const express = require('express')
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const app = express()
const port = 3000
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')

console.log("Starting up OOTin Map!")


app.get('/', (req, res) => {
	var places = JSON.parse(fs.readFileSync('./data/places.json','utf8'));
	var entrances = JSON.parse(fs.readFileSync('./data/entrances.json','utf8'));
	
	return res.render('index',{
		places:places,
		entrances:entrances
	});
});

app.get('/spoiler-test', (req, res) => {
	var places = JSON.parse(fs.readFileSync('./data/places.json','utf8'));
	var entrances = JSON.parse(fs.readFileSync('./data/entrances.json','utf8'));

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

	var spoilers = JSON.parse(fs.readFileSync('./data/examples/spoilers.json','utf8'));
	let spoilers_e = spoilers.entrances;

	let spoilers_result = [];
	_.each(spoilers_e,function(d,e){
		let source = _.findWhere(sorted_e,{nick:e});

		let dest = {};
		if(typeof d === 'object'){
			dest = _.findWhere(sorted_e,{nick:d.from+' -> '+d.region});
			spoilers_result.push({
				from:source.from,
				to:dest.to,
				lat:source.lat,
				lng:source.lng
			});
		} else {
			dest = _.findWhere(places,{name:d});
			if(typeof dest === 'undefined'){
				return;
			}

			spoilers_result.push({
				from:source.from,
				to:dest.id,
				lat:source.lat,
				lng:source.lng
			});
		}
	});
	
	return res.render('index',{
		places:places,
		entrances:spoilers_result,
	});
});

app.listen(process.env.PORT || port)