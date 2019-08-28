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

let bgWidth = 23848;
let bgHeight = 23040;

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
				width:bgWidth,
				height:bgHeight,
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

let generateMapGrid = () => {
	return new Promise((resolve,reject) => {
		console.log('Done generating Big Map! Generating Map Pieces...');
		let gridDims = 256;
		let wPieces = bgWidth/gridDims;
		let hPieces = bgHeight/gridDims;
		let zoomLevels = 1;
		let bigFile = sharp(endPresentFile).limitInputPixels(false);

		for (var z = 0; z < zoomLevels; z++) {
			if (!fs.existsSync(gridPath+z)){
			    fs.mkdirSync(gridPath+z);
			}
			for (var x = 0; x < wPieces; x++) {
				if (!fs.existsSync(gridPath+z+'/'+x)){
				    fs.mkdirSync(gridPath+z+'/'+x);
				}
				for (var y = 0; y < hPieces; y++) {
					path = gridPath+z+'/'+x+'/';
					try{
						bigFile
							.extract({left:x*gridDims,top:y*gridDims,width:gridDims,height:gridDims})
							.toFile(path+y+'.jpg')
					} catch(e){
						// ehh
					}
				}
			}
		}
	});
}

getMaps().then(function(){
	generateBigMap().then(function(){
		generateMapGrid()
	});
});