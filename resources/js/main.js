$(document).ready(function(){

	let config = {
		markers_hidden:false,
		navlines_hidden:true,
		vanilla:true
	}

	let activeNavLines = [];
	let activeMarkers = [];
	let activeRoute = [];

 	var map = L.map('map', {
 		minZoom:0,
 		maxZoom: 7,
		zoom: 2,
 		center: [-12,0],
 	});
 	L.tileLayer('./images/grid/{z}/{x}/{y}.jpg',{noWrap:true}).addTo(map);
 	
 	// map.on('click',function(e){
 	// 	console.log(JSON.stringify(e.latlng));
 	// });

 	function renderEntrances(ent){
	 	_.each(ent,function(e){
	 		let rItems = [];
 			if(typeof e.from !== 'undefined'){
 				if(typeof e.nick !== 'undefined'){
 					title = e.nick+' ('+e.from+' -> '+e.to+')';
 				} else if(typeof e.from === 'string') {
					title = '('+e.from+' -> '+e.to+')';
 				} else {
	 				from = _.findWhere(places,{"id":e.from});
	 				to = _.findWhere(places,{"id":e.to});
	 				title = from.name+' -> '+to.name+' ('+e.from+' -> '+e.to+')';
 				}
 			} else {
	 			return;
 			}

 			if(typeof e.required_items !== 'undefined'){
 				_.each(e.required_items,function(r){
 					rItems.push(_.findWhere(items,{id:r}).name);
 				})
 			}

 			var m = L.marker([e.lat, e.lng],{title:title});

 			let popupContent = $('<div></div>');
 			popupContent.append('<p>'+title+'</p>');
 			if(rItems.length){
 				popupContent.append('<div>Required Items:</div><ul class="required_items"></ul>')
 				_.each(rItems,function(r){
 					popupContent.find('.required_items').append('<li>'+r+'</li>')
 				});
 			}

 			m.bindPopup(popupContent[0]).openPopup();
 			m.addTo(map);
 			activeMarkers.push(m);
 		});
 	}

 	function renderPaths(ent){
 		let oneways = [];
 		_.each(ent,function(e){
 			let frome = e;
 			let toe = {};
 			let linecolor = 'red';

 			if(typeof frome.oneway !== 'undefined' && typeof frome.extra_to !== 'undefined'){
				toe = frome.extra_to;
				linecolor = 'yellow';
 			} else {
 				toe = _.findWhere(ent,{to:frome.from,from:frome.to});
 			}
 			if(typeof toe == 'undefined'){
				console.log('Could not find exit for: '+frome.from+' -> '+frome.to);
 				return;
 			}

 			if(oneways.includes(frome.from+'x'+frome.to)){
 				//console.log('Already plotted this line one way, skipping');
 				//return;
 			}

			let line = L.polyline([[frome.lat,frome.lng],[toe.lat,toe.lng]],{color:linecolor});
			oneways.push(toe.to+'x'+toe.from);
			activeNavLines.push(line);
 		});
 	}

 	function findPath(place1,place2){
 		_.each(activeRoute,function(r){
			map.removeLayer(r);
		});
		$('.route-table li').remove();
 		activeRoute = [];
 		let linecolor = 'green';
		let graph = [];
		_.each(entrances,function(e){
			let o = {
				from:e.from,
				to:e.to,
				cost:1
			};
			if(typeof e.oneway !== 'undefined'){
				o.oneway = true;
			}
			graph.push(o);
		});
		
		let finalroute = [];
		let finalitems = [];
		let vertices = compileVertices(graph);
		let route = findRoute(vertices[place1],vertices[place2]).route;

		let lastpath = false;
		for (i = 0; i < route.length; i++) {
			let r = route[i];
			let s = r.label;
			if(typeof route[i+1] === 'undefined'){
				break;
			}
			let d = route[i+1].label;						
			let frome = _.findWhere(entrances,{from:s,to:d});
			let toe = _.findWhere(entrances,{from:d,to:s});

			let path = [[frome.lat,frome.lng],[toe.lat,toe.lng]];
			if(lastpath !== false){
				path.unshift([lastpath.lat,lastpath.lng]);
			}

			let line = L.polyline(path,{color:linecolor}).addTo(map);

			finalroute.push({
				from:s,
				from_name:_.findWhere(places,{id:s}).name,
				to:d,
				to_name:_.findWhere(places,{id:d}).name,
			});
			activeRoute.push(line);

			if(typeof frome.required_items !== 'undefined'){
				_.each(frome.required_items,function(ri){
					let i = _.findWhere(items,{id:ri});
					if(!finalitems.includes(i.name)){
						finalitems.push(i.name);
					}
				});
			}

			if(typeof toe.required_items !== 'undefined'){
				_.each(toe.required_items,function(ri){
					let i = _.findWhere(items,{id:ri});
					if(!finalitems.includes(i.name)){
						finalitems.push(i.name);
					}
				});
			}

			$('.route-table').append('<li>'+_.findWhere(places,{id:s}).name+' -> '+_.findWhere(places,{id:d}).name+"</li>")
			lastpath = toe;
		}
		_.each(finalitems,function(ri){
			$('.items-table').append('<li>'+ri+'</li>')
		});
		toggleMarkers(true);
		togglePaths(true);
 	}

 	function toggleMarkers(force_hide){
 		if(force_hide){
 			config.markers_hidden = false;
 		}
 		_.each(activeMarkers,function(m){
 			if(config.markers_hidden){
 				$(m._icon).fadeIn(300);
 				$(m._shadow).fadeIn(300);
 			} else {
 				$(m._icon).fadeOut(300);
 				$(m._shadow).fadeOut(300);
 			}
 		});
 		if(config.markers_hidden){
			config.markers_hidden = false;
		} else {
			config.markers_hidden = true;
		}
 	}

 	function togglePaths(force_hide){
 		if(force_hide){
 			config.navlines_hidden = false;
 		}
 		_.each(activeNavLines,function(m){
 			if(config.navlines_hidden){
 				map.addLayer(m);
 			} else {
 				map.removeLayer(m);
 			}
 		});
 		if(config.navlines_hidden){
			config.navlines_hidden = false;
		} else {
			config.navlines_hidden = true;
		}
 	}

 	function cleanSlate(){
 		let r = []
 		_.each(r.concat(activeMarkers,activeNavLines,activeRoute),function(m){
    		map.removeLayer(m)
        });
        activeMarkers = [];
        activeNavLines = [];
        activeRoute = [];
        $('.seed-id').empty();
 	}

 	$('#sidebar #upload-spoilers input[type="file"]').change(function(){
 		let fd = new FormData(); 
        let files = $(this)[0].files[0]; 
        fd.append('file', files); 

 		$.ajax({ 
            url: '/spoiler-upload', 
            type: 'post', 
            data: fd, 
            contentType: false, 
            processData: false, 
            success: function(response){ 
            	if(typeof response.error !== 'undefined'){
            		alert(response.error);
            		return;
            	}
                entrances = response.entrances;
                cleanSlate();
                config.vanilla = false;
                renderEntrances(entrances);
			 	renderPaths(entrances);
			 	$('.seed-id').html(response.seed);
			 	$('#sidebar #upload-spoilers input[type="file"]').val('');
            }, 
        }); 
 	});

 	$('#sidebar #route-planner .start-route').click(function(e){
 		e.preventDefault();
 		let from = $('#route-planner .route-from select').val();
 		let to = $('#route-planner .route-to select').val();

 		findPath(from,to)
 	});

 	$('#sidebar #route-planner .clear-route').click(function(e){
 		e.preventDefault();
 		_.each(activeRoute,function(r){
 			map.removeLayer(r);
 		});
 		activeRoute = [];
 		$('.route-table').empty();
 		toggleMarkers(false);
 		togglePaths(false);
 	});

 	$('#sidebar #toggles .toggle-markers').click(function(e){
 		e.preventDefault();
		toggleMarkers(false);
 	});

 	$('#sidebar #toggles .toggle-nav').click(function(e){
 		e.preventDefault();
 		togglePaths(false);
 	});

 	$('#sidebar #toggles .vanilla-reset').click(function(e){
 		e.preventDefault();
 		if(config.vanilla){
 			alert('Already looking at vanilla')
 			return;
 		}
 		entrances = vanillaEntrances;
 		cleanSlate();
 		renderEntrances(entrances);
	 	renderPaths(entrances);
	 	config.vanilla = true;
 	});

 	renderEntrances(entrances);
 	renderPaths(entrances);
});