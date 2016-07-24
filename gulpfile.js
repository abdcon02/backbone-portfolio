'use strict'

const   gulp         = require('gulp'),
        autoprefixer = require('gulp-autoprefixer'),
        gutil        = require('gulp-util'),
        watch        = require('gulp-watch'),
        sass         = require('gulp-sass'),
        rename       = require('gulp-rename'),
        uglify       = require('gulp-uglify'),
        imagemin     = require('gulp-imagemin'),
        sourcemaps   = require('gulp-sourcemaps'),
        concat       = require('gulp-concat'),
        livereload   = require('gulp-livereload')

const projectTheme = './'

const config = Object.freeze({
    production: !!gutil.env.production
})

const themePaths = Object.freeze({
    css: projectTheme + 'css',
    js: projectTheme + 'js',
    images: projectTheme + 'images'
})

const sourcePaths = Object.freeze({
    browserSass: projectTheme + 'source/scss/styles.scss',
    sass: projectTheme + 'source/scss/**/*.scss',
    js : projectTheme + 'source/js/**/*.js',
    images: projectTheme + 'source/images/*',
    path : projectTheme + 'source/**/*',
    app: projectTheme + 'app/**/*'
})


gulp.task('default', ['compileSass', 'compressImages', 'compressJs'])

const sassTask = function(srcPaths) {
    return gulp.src(srcPaths)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths:
                [
                    require('bourbon').includePaths
                ]
        })
            .on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./source-maps'))
        .pipe(gulp.dest(themePaths.css))
        .pipe(config.production ? gutil.noop() : livereload())
}

gulp.task('compileBrowserSass', function() {
    return sassTask(sourcePaths.browserSass)
})

gulp.task('compileSass', function() {
    return sassTask(sourcePaths.sass)
})

gulp.task('compressImages', function() {
    return gulp.src(sourcePaths.images)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(themePaths.images))
        .pipe(config.production ? livereload() : gutil.noop())
})

gulp.task('compressJs', function() {
    return gulp.src(sourcePaths.js)
        .pipe(config.production ? uglify({compress: config.production, mangle: config.production}) : gutil.noop())
        .pipe(gulp.dest(themePaths.js))
        .pipe(config.production ? livereload() : gutil.noop())
})

gulp.task('watch', function() {
    gutil.log('starting to watch ' + sourcePaths.path)
    livereload.listen()
    gulp.watch(sourcePaths.path, ['compileBrowserSass', 'compressJs'])
})