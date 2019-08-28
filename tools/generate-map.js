const fs = require('fs');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const sharp = require('sharp');
const argv = require('yargs').argv;

const prePath = 'https://www.vgmaps.com/Atlas/N64/';
const endPath = './src/mapsources/';
const endPresentFile = './src/mapfiles/big.jpg';
const gridPath = './src/mapfiles/grid/';

let bgSize = 23848;
let gridDims = 256;
let zoomLevels = 7;

let downloadMap = (filename,endname) => {
	return new Promise((resolve,reject) => {
		request(prePath+filename,{encoding:'binary'},function (error, response, body) {
			fs.writeFile(endname,body,'binary',function(err){});
			resolve(endname);
		});
	})
}

let getMaps = () => {
	return new Promise((resolve,reject) => {
		if(argv.skip_download){
			//console.log('Being told to skip the map download, doin it');
			resolve(true);
			return;
		}
		request(prePath+'index.htm', function (error, response, body) {
			var dom = JSDOM.fragment(body);
			var ootTable = dom.querySelector("table#table4");

			for (var i = 0, row; row = ootTable.rows[i]; i++) {
				thisrow:
				for (var j = 0, col; col = row.cells[j]; j++) {
					for (var k = 0, el; el = col.children[k]; k++) {
						if(!el.textContent.includes('(Top)')){
							break thisrow;
						}

						var filename = el.href;
						endname = endPath+(filename.replace('LegendOfZelda-OcarinaOfTime-','').replace('(Top)','').replace(/[^A-Za-z0-9.\-]/g, ''));

						if(fs.existsSync(endname)){
							console.log('Skipping '+endname+' cause already exists');
							break thisrow;
						}

						downloadMap(filename,endname).then(
							filename => console.log('Downloaded '+filename)
						)
					}
				}
			};
			resolve(true);
			console.log('Done getting source images, making (hopefully) coheive map...');
			return;
		});
	})
}

let generateBigMap = () => {
	return new Promise((resolve,reject) => {
		console.log('Generating Big Map...');
		let mapLayout = JSON.parse(fs.readFileSync(endPath+'map.json')).layout;

		var maps = []
		mapLayout.forEach(place => {
			let fullpath = endPath+place.file;
			if(fs.existsSync(fullpath)){
				console.log('Found file '+fullpath);
				maps.push({input:fullpath,top:place.y,left:place.x});
			}
		});

		sharp({
			create:{
				width:bgSize,
				height:bgSize,
				channels:4,
				background: { r: 0, g: 0, b: 0 }
			}
		})
		.limitInputPixels(false)
		.composite(maps)
		.toFile(endPresentFile).then(function(){
			resolve(true);
		});
	});
}

let generateGridPiece = async function(image,x,y){
	image.extract({left:x*gridDims,top:y*gridDims,width:gridDims,height:gridDims})
		.toFile(path+y+'.jpg');
}

let generateMapGrid = async function(){
	console.log('Done generating Big Map! Generating Map Pieces...');
	console.log('This will take a while...')
	let bigFile = sharp(endPresentFile).limitInputPixels(false);

	for (var z = zoomLevels; z >= 0; z--) {
		if (!fs.existsSync(gridPath+z)){
		    fs.mkdirSync(gridPath+z);
		}

		let tWidth = gridDims;
		let tHeight = gridDims;
		let pieces = 1;

		if(z > 0){
			pieces = Math.pow(2,z+1)/2;
			percent = z/zoomLevels;
			tWidth = pieces*gridDims;
			tHeight = pieces*gridDims;
		}
		console.log('Starting zoom level '+z+' at '+pieces+'x'+pieces+' ('+tWidth+'x'+tHeight+')');

		let resized = bigFile.clone().resize({width:tWidth,height:tHeight});

		for (var x = 0; x < pieces; x++) {
			path = gridPath+z+'/'+x+'/';

			if (!fs.existsSync(path)){
			    fs.mkdirSync(path);
			}

			for (var y = 0; y < pieces; y++) {
				var gridpiece = await generateGridPiece(resized,x,y);
			}
		}
	}
}

getMaps().then(function(){
	generateBigMap().then(function(){
		generateMapGrid()
	});
});