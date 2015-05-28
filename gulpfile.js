var gulp = require('gulp'),
	browserSync = require('browser-sync'),
	sass = require('gulp-sass'),
	wiredep = require('wiredep').stream,
	autoprefixer = require('gulp-autoprefixer'),
	inject = require('gulp-inject'),
	eventStream = require('event-stream'),
	templateCache = require('gulp-angular-templatecache'),
	concat = require('gulp-concat'),
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify');

gulp.task('sass', ['scss'], function () {
	return gulp.src('./src/styles/**/*.scss')
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(autoprefixer())
		.pipe(gulp.dest('./src/styles'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('scss', function () {
	return gulp.src('./src/styles/main.scss')
		.pipe(wiredep({
			directory: './bower_components'
		}))
		.pipe(gulp.dest('./src/styles'));
});

gulp.task('inject', function () {
	return gulp.src('./src/index.html')
		.pipe(inject(
			gulp.src(['./src/styles/**/*.css','./src/scripts/**/*.js'], {read :false}),
			{relative: false}
		))
		.pipe(wiredep({
			directory: './bower_components'
		}))
		.pipe(gulp.dest('./src'));
});

gulp.task('serve', ['sass', 'inject'], function () {
	browserSync({
        server: {
            baseDir: './',
            index: 'src/index.html',
            //directory: true,
            routes: {
                '/views': './src/views'
            }
        },
        port: 9000,
        ui: {
        	port: 9001
        }
    });

    gulp.watch('./src/styles/**/*.scss', ['sass']);
    gulp.watch(['./src/**/*.html','./src/scripts/**/*.js'], browserSync.reload);
});

gulp.task('mv', function () {
	return gulp.src('./src/styles/_awesome.scss')
		.pipe(autoprefixer())
		.pipe(gulp.dest('./dist'));
});

gulp.task('build', ['mv'], function () {
	return eventStream.merge(
			gulp.src('./src/scripts/awesome.*.js'),
			gulp.src('./src/views/**/*.html')
				.pipe(templateCache({
					module: 'netAwesome',
					root: 'views'
				}))
		)
		.pipe(concat('awesome.min.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);
