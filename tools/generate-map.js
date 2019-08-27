const fs = require('fs');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const prePath = 'https://www.vgmaps.com/Atlas/N64/';
const endPath = './src/mapsources/';

let downloadMap = (filename,endname) => {
	return new Promise((resolve,reject) => {
		//console.log('Downloading '+filename);
		request(prePath+filename,{encoding:'binary'},function (error, response, body) {
			fs.writeFile(endname,body,'binary',function(err){});
			resolve(endname);
		});
	})
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
				if(filename.includes('-Present-')){
					endname += 'present/'+(filename.split('-').pop().replace('(Top)','').replace(/[^A-Za-z0-9.]/g, ''));
				}
				if(filename.includes('-Future-')){
					endname += 'future/'+(filename.split('-').pop().replace('(Top)','').replace(/[^A-Za-z0-9.]/g, ''));
				}

				if(fs.existsSync(endname)){
					console.log('Skipping '+endname+' cause already exists');
					break;
				}

				downloadMap(filename,endname).then(
					filename => console.log('Downloaded '+filename)
				)
			}
		}
	};
});