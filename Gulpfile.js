'use strict';

var gulp      = require('gulp'),
	// CSS
	sass        = require('gulp-sass'), //Compilar Sass
	cleanCSS    = require('gulp-clean-css'),
	// HTML
	pug         = require('gulp-pug'), //Compilar Pug
	htmlmin     = require('gulp-htmlmin'), //Comprimir HTML
	// Imágenes
	image       = require('gulp-image'), //Optimiza imágenes PNG, JPEG, GIF y SVG, pero no lo usaremos para archivos PNG, a cambio usaremos tinypng
	imagemin    = require('gulp-tinypng'),//Optimiza archivos PNG con mayor eficiencia, pero se necesita de un token. Para más info visitar -> https://tinypng.com
	// JS
	uglify      = require('gulp-uglify'), //Optimizar archivos javascript
	stripDebug  = require('gulp-strip-debug'), //Eliminar comentarios y comandos como console.log
	concat      = require('gulp-concat'), //Concatenar
	// Utilidades
	changed     = require('gulp-changed'), //Verificar si el archivo ha cambiando para aplicarle o no un pipe
	plumber     = require('gulp-plumber'), //Seguir ejecutando los pipe de gulp aunque exista un error
	size        = require('gulp-size'),
	// Servidor livereload
	browserSync = require('browser-sync').create();

// Rutas de desarrollo y producción
var devPath = './app/';
var prodPath = './public/';

// Servidor de desarrollo
gulp.task('server-dev', function() {

	browserSync.init({
		server: {
			baseDir: './app'
		}
	});
});


// Procesar archivos Pug
gulp.task('pug', function(){

	gulp.src('./pug/pages/*.pug')
		.pipe(plumber())
		.pipe(pug({ pretty: true }))
		.pipe(gulp.dest('./app/'))
		.pipe(browserSync.stream());
});

// Optimizar HTML
gulp.task('html', function(){

	gulp.src('./app/*.html')
		.pipe(changed('./public/'))
		.pipe(plumber())
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(size({title: 'HTML Optimizado:'}))
		.pipe(gulp.dest(prodPath));

});

// Procesar archivos Sass
gulp.task('sass', function(){

	return gulp.src('./sass/app.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./app/css/'))
		.pipe(browserSync.stream());
});

// Procesar CSS
gulp.task('css', function(){
	gulp.src(['./app/css/**/*.css'])
		.pipe(changed('./public/css'))
		.pipe(cleanCSS())
		.pipe(size({title: 'CSS Optimizado:'}))
		.pipe(gulp.dest('./public/css'));

});

// Rutas de archivos Javascript
var homeFiles = [
	'./bower_components/jquery/dist/jquery.js',
	'./app/js/home.js'
];

// Javascript
gulp.task('js-dev', function () {

	//Página Home
	gulp.src(homeFiles)
		.pipe(concat('home.min.js'))
		//.pipe(uglify().on('error', function(e) { console.log('\x07',e.message); return this.end(); })) //--> Muestra un mensaje más completo del error
		.pipe(size({title: 'JS Contatenado:'}))
		.pipe(gulp.dest(devPath + 'js/'))
		.pipe(browserSync.stream());

});

// Javascript
gulp.task('js', function () {

	//Página Home
	gulp.src(homeFiles)
		.pipe(changed(prodPath + 'js/'))
		.pipe(concat('home.min.js'))
		.pipe(uglify())
		//.pipe(uglify().on('error', function(e) { console.log('\x07',e.message); return this.end(); })) //--> Muestra un mensaje más completo del error
		.pipe(stripDebug())
		.pipe(size({title: 'JS Optimizado:'}))
		.pipe(gulp.dest(prodPath + 'js/'));

});

// Optimizar JPG y GIF
gulp.task('images', function(){

	gulp.src([devPath + 'img/*', '!'+devPath+'img/*.png'])
		.pipe(changed(prodPath + 'img/'))
		.pipe(image({
      progressive: true,
      interlaced: true
    }))
		.pipe(gulp.dest(prodPath + 'img/'));
});

// Optimizar PNG
gulp.task('png', function(){

	gulp.src(devPath + 'img/*.png')
		.pipe(changed(prodPath + 'img/'))
		.pipe(imagemin('CHD9zVb-3FcqW3C0kzIX_fR3L-UArybO'))
    .pipe(size({title: 'PNG Optimizados:'}))
		.pipe(gulp.dest(prodPath + 'img/'));
});

// Copiar archivos
gulp.task('copy', function(){

	// Fuentes
	gulp.src(devPath + 'fonts/**/*')
		.pipe(changed(prodPath + 'fonts/'))
		.pipe(gulp.dest(prodPath + 'fonts/'));

	// Favicon
	gulp.src(devPath + '**/*.ico')
		.pipe(changed(prodPath))
		.pipe(gulp.dest(prodPath));

});

// Tareas de desarrollo
gulp.task('dev', function(){

	gulp.start('server-dev');
  gulp.watch('./pug/**/*.pug', ['pug']);
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./app/js/**/*.js', ['js-dev']);

});

// Tareas de producción
gulp.task('prod', function(){

	gulp.start('html');
	gulp.start('js');
	gulp.start('css');
	gulp.start('copy');
	gulp.start('images');
	gulp.start('png');

});
