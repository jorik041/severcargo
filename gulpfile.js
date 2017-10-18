var gulp = require ('gulp'),
    browserSync = require ('browser-sync').create(),
    //pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    sassGlob = require('gulp-sass-glob'),    
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    nodemon = require('gulp-nodemon'),
    reload = browserSync.reload;

gulp.task('nodemon', cb => {
	
	var started = false;
	
	nodemon({
		script: 'start.js'
	}).on('start', function () {

		if (!started) {
			cb();
			started = true; 
		} 
	});
});

// Compile sass files to css
gulp.task('sass', () =>  {
    gulp.src('./public/sass/**/*.scss')
        .pipe(sassGlob())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/dist/css'))
        .pipe(browserSync.reload({stream:true}))
});

// gulp.task('pug', () => {
//    gulp.src('./views/*.pug')
//     .pipe(plumber())
//     .pipe(pug({
//       pretty: '\t'
//     }))
//     .pipe(gulp.dest('./public'))
// });

gulp.task('browser-sync', () => {
    browserSync.init(null, {
		proxy: "http://localhost:4000",
        files: ["./**/*.*"],
        port: 7000,
    });
    
   // browserSync.watch('./*.*').on('change', browserSync.reload);
});

gulp.task('watch',  () => {
    gulp.watch('./public/sass/**/*.scss').on('change', gulp.parallel('sass'));
    //gulp.watch('./views/**/*.pug').on('change', browserSync.reload);
    
    //gulp.watch('./views/**/*.pug', ['pug']);
    gulp.watch(['./**/*.*'] ).on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('watch', 'browser-sync', 'nodemon') );
