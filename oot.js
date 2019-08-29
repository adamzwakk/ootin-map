const express = require('express')
const fs = require('fs');
const path = require('path');

const app = express()
const port = 3000
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')

console.log("Starting up OOTin Map!")
var places = fs.readFileSync('./data/places.json','utf8');
var entrances = fs.readFileSync('./data/entrances.json','utf8');

app.get('/', (req, res) => {
	return res.render('index',{places:places,entrances:entrances});
});

app.listen(process.env.PORT || port)