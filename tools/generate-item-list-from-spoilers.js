const fs = require('fs');
const _ = require('underscore');

let items = JSON.parse(fs.readFileSync('./data/examples/spoilers.json')).item_pool;
let itemcount = 1;
let bottlecount = 1;
let finalObj = [];

function getPItemName(name){
	// Hookshot/Longshot
	// Ocarina
	// Dive Scale
	// Gauntlets
}

_.each(items,function(n,i){
	if(i.includes('Bottle')){
		i = 'Bottle ('+bottlecount+')';
		bottlecount++;
	}
	if(n>1){
		for (var j = 0; j < n; j++) {
			let found = false;
			_.each(finalObj,function(f){
				if((i.includes('Arrows') || i.includes('Bombs') || i.includes('Bombchus') || i.includes('Rupee') || i.includes('Piece of Heart') || i.includes('Heart Container') || i.includes('Recovery Heart') || i.includes('Ice Trap')) &&
					(f.name.includes('Arrows') || f.name.includes('Bombs') || i.includes('Bombchus') || f.name.includes('Rupee') || f.name.includes('Piece of Heart') || f.name.includes('Heart Container') || f.name.includes('Recovery Heart') || f.name.includes('Ice Trap'))){
					found = true;
				}
			});
			if(found){
				if(typeof _.findWhere(finalObj,{name:i}) !== 'undefined'){
					continue;
				}
			}
			finalObj.push({
				id:itemcount,
				name:i
			});

			itemcount++;
		}
	} else {
		if(typeof _.findWhere(finalObj,{name:i}) === 'undefined'){
			finalObj.push({
				id:itemcount,
				name:i
			});
	
			itemcount++;
		}
	}
	
});

console.log(JSON.stringify(finalObj));