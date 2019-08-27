const fs = require('fs');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const sharp = require('sharp');
const argv = require('yargs').argv;

const prePath = 'https://www.vgmaps.com/Atlas/N64/';
const endPath = './src/mapsources/';
const endPresentFile = './src/mapfiles/big.png';

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
				for (var j = 0, col; col = row.cells[j]; j++) {
					for (var k = 0, el; el = col.children[k]; k++) {
						if(!el.textContent.includes('(Top)')){
							break;
						}

						endname = endPath;

						var filename = el.href;
						endname = endPath+(filename.replace('LegendOfZelda-OcarinaOfTime-','').replace('(Top)','').replace(/[^A-Za-z0-9.\-]/g, ''));

						if(fs.existsSync(endname)){
							console.log('Skipping '+endname+' cause already exists');
							break;
						}

						if(endname == ''){
							console.log('Could not determine time for '+filename+', skipping');
							break;
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

getMaps().then(function(){
	console.log('Generating Big Map...');
	let presentConfig = JSON.parse(fs.readFileSync(endPath+'map.json')).data;

	var maps = []
	presentConfig.forEach(place => {
		maps.push({input:endPath+place.file,top:place.y,left:place.x});
	});
	sharp({
		create:{
			width:21248,
			height:23040,
			channels:4,
			background: { r: 0, g: 0, b: 0, alpha: 1 }
		}
	})
	.limitInputPixels(false)
	.composite(maps)
	.png()
	.toFile(endPresentFile).then(function(){
		console.log('Done generating Big Map!');
	});
})