var gulp = require('gulp');

gulp.task('default', function() {
	var extCss = gulp.src(['./node_modules/leaflet/dist/leaflet.css']).pipe(gulp.dest('public/css'));
	var extJS = gulp.src([
		'./node_modules/leaflet/dist/leaflet.js',
		'./node_modules/underscore/underscore-min.js',
		'./node_modules/jquery/dist/jquery.min.js'])
	.pipe(gulp.dest('./public/js'));

	//temp marker images for leaflet
	var markerImgs = gulp.src(['./node_modules/leaflet/dist/images/*.png']).pipe(gulp.dest('./public/css/images'))

	return [extCss,extJS,markerImgs];
});

gulp.task('copy-grid',function(){
	return gulp.src(['assets/mapfiles/grid/**/*']).pipe(gulp.dest('./public/images/grid'));
});