var gulp = require('gulp');

gulp.task('default', function() {
	var extCss = gulp.src([
		'./node_modules/leaflet/dist/leaflet.css',
		'./node_modules/selectize/dist/css/selectize.css']).
	pipe(gulp.dest('public/css'));

	var extJS = gulp.src([
		'./node_modules/leaflet/dist/leaflet.js',
		'./node_modules/underscore/underscore-min.js',
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/selectize/dist/js/standalone/selectize.min.js',
		'./resources/js/dijkstra.js'])
	.pipe(gulp.dest('./public/js'));

	//temp marker images for leaflet
	var markerImgs = gulp.src(['./node_modules/leaflet/dist/images/*.png']).pipe(gulp.dest('./public/css/images'))

	return [extCss,extJS,markerImgs];
});

gulp.task('compile-js',function(){
	return gulp.src(['./resources/js/**/*.js']).pipe(gulp.dest('public/js'));
});

gulp.task('watch',function(){
	gulp.watch('./resources/js/**/*.js',gulp.series('compile-js'))
});

gulp.task('copy-grid',function(){
	return gulp.src(['assets/mapfiles/grid/**/*']).pipe(gulp.dest('./public/images/grid'));
});