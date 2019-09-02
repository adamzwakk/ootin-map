const fs = require('fs');
const _ = require('underscore');

let items = JSON.parse(fs.readFileSync('./data/examples/spoilers.json')).item_pool;
let itemcount = 1;
let bottlecount = 1;
let finalObj = [];
let bossRewards = [
	'Kokiri Emerald',
	'Goron Ruby',
	'Zora Sapphire',
	'Light Medallion',
	'Forest Medallion',
	'Fire Medallion',
	'Water Medallion',
	'Shadow Medallion',
	'Spirit Medallion',
	'Master Sword',
	'Zeldas Letter'
];

function getPItemName(name,num){
	let betterNames = {
		"Progressive Hookshot":[
			"Hookshot",
			"Longshot"
		],
		"Ocarina":[
			"Fairy Ocarina",
			"Ocarina of Time"
		],
		"Progressive Scale":[
			"Silver Scale",
			"Gold Scale"
		],
		"Progressive Strength Upgrade":[
			"Goron Bracelet",
			"Silver Gauntlets",
			"Gold Gauntlets"
		]
	};
	if(typeof betterNames[name] === 'undefined'){
		return name;
	}
	name = betterNames[name][num];
	return name;
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
				name:getPItemName(i,j)
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

_.each(bossRewards,function(r){
	finalObj.push({
		id:itemcount,
		name:r
	});

	itemcount++;
})

console.log(JSON.stringify(finalObj));