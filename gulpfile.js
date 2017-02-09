// Gulp tasks

// gulp: 				run default gulp task (sass, js, watch, browserSync) for web development;
// build: 			build project to dist folder (cleanup, image optimize, removing unnecessary files);
// deploy: 			project deployment on the server from dist folder via FTP;
// clearcache: 	clear all gulp cache.

// Rules for working with the starting HTML template

// All HTML files should have similar initial content as in app/index.html;
// Template Basic Images Start comment in app/index.html - all your custom template basic images (og:image for social networking, favicons for a variety of devices);
// Custom Browsers Color Start comment in app/index.html: set the color of the browser head on a variety of devices;
// Custom HTML comment in app/index.html - all your custom HTML;
// For installing new jQuery library, just run the command "bower i plugin-name" in the terminal. Libraries are automatically placed in the folder app/libs. Bower must be installed in the system (npm i -g bower). Then place all jQuery libraries paths in the 'libs' task (gulpfile.js);
// All custom JS located in app/js/common.js;
// All Sass vars placed in app/sass/_vars.sass;
// All Bootstrap media queries placed in app/sass/_media.sass;
// All jQuery libraries CSS styles placed in app/sass/_libs.sass;
// Rename ht.access to .htaccess before place it in your web server. This file contain rules for files caching on web server.



var gulp           = require('gulp'), // Подключаем Gulp 
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'), //Подключаем Sass пакет,
		browserSync    = require('browser-sync'), // Подключаем Browser Sync
		concat         = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
		uglify         = require('gulp-uglify'), // Подключаем gulp-uglifyjs (для сжатия JS)
		cleanCSS       = require('gulp-clean-css'), // Подключаем пакет для минификации CSS
		rename         = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
		del            = require('del'), // Подключаем библиотеку для удаления файлов и папок
		imagemin       = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
		cache          = require('gulp-cache'), // Подключаем библиотеку кеширования
		autoprefixer   = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
		bourbon        = require('node-bourbon'), //A simple and lightweight mixin library for Sass
		ftp            = require('vinyl-ftp'), //Blazing fast vinyl adapter for FTP. Supports parallel transfers, conditional transfers, buffered or streamed files, and more. Often performs better than your favorite desktop FTP client
		notify         = require("gulp-notify"); //gulp plugin to send messages based on Vinyl Files or Errors to Mac OS X, Linux or Windows using the node-notifier module. Fallbacks to Growl or simply logging

// Скрипты проекта
gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Всегда в конце
		])
	.pipe(concat('scripts.min.js')) // Собираем их в кучу в новом файле scripts.min.js
	.pipe(uglify()) // Сжимаем JS файл
	.pipe(gulp.dest('app/js')) // Выгружаем в папку app/js
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false, // Отключаем уведомления
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('sass', function() { // Создаем таск Sass
	return gulp.src('app/sass/**/*.sass') // Берем источник
	.pipe(sass({ // Преобразуем Sass в CSS посредством gulp-sass
		includePaths: bourbon.includePaths
	}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions'])) // Создаем префиксы
	.pipe(cleanCSS())
	.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
	.pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('watch', ['sass', 'scripts', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['scripts']); // Наблюдение за JS файлами в папке js
	gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
	.pipe(cache(imagemin())) // Сжимаем их
	.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

// Сборка проекта в продакшн
gulp.task('build', ['removedist', 'imagemin', 'sass', 'scripts'], function() {

	var buildFiles = gulp.src([ // Переносим HTML в продакшен
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/main.min.css',
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([ // Переносим скрипты в продакшен
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([ // Переносим шрифты в продакшен
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});


// загрузка проекта на сервер
gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', function() { return del.sync('dist'); }); // Удаляем папку dist перед сборкой
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
