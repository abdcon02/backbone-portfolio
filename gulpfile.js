'use strict'

const   gulp         = require('gulp'),
        autoprefixer = require('gulp-autoprefixer'),
        gutil        = require('gulp-util'),
        watch        = require('gulp-watch'),
        sass         = require('gulp-sass'),
        rename       = require('gulp-rename'),
        uglify       = require('gulp-uglify'),
        sourcemaps   = require('gulp-sourcemaps'),
        concat       = require('gulp-concat'),
        livereload   = require('gulp-livereload'),
        bourbon      = require('bourbon');

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
    sass: projectTheme + 'source/scss/**/*.scss',
    js : projectTheme + 'source/js/**/*.js',
    images: projectTheme + 'source/images/*',
    path : projectTheme + 'source/**/*',
    app: projectTheme + 'app/**/*'
})


gulp.task('default', ['compileSass', 'compileImages', 'compileJs'])

gulp.task('compileSass', function() {
    return gulp.src(sourcePaths.sass)
        .pipe(config.production ? gutil.noop() : sourcemaps.init())
        .pipe(sass({
            includePaths:
                [
                    bourbon.includePaths
                ],
            outputStyle: config.production ? 'compressed' : 'nested'
        })
            .on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(config.production ? gutil.noop() : sourcemaps.write())
        .pipe(gulp.dest(themePaths.css))
        .pipe(config.production ? gutil.noop() : livereload())
})

gulp.task('compileImages', function() {
    // TODO: compile source images
    return gulp.src(sourcePaths.images)
        .pipe(gulp.dest(themePaths.images))
        .pipe(config.production ? livereload() : gutil.noop())
})

gulp.task('compileJs', function() {
    return gulp.src(sourcePaths.js)
        .pipe(config.production ? gutil.noop() : sourcemaps.init())
        .pipe(uglify({
            mangle: config.production,
            compress: config.production ? {} : false,
            preserveComments: config.production ? 'license' : 'all',
            output: config.production ? {} : {
                beautify: true,
                bracketize: true
            }
        }))
        .pipe(config.production ? gutil.noop() : sourcemaps.write())
        .pipe(gulp.dest(themePaths.js))
})

gulp.task('watch', function() {
    gutil.log('starting to watch ' + sourcePaths.path)
    livereload.listen()
    gulp.watch(sourcePaths.path, ['compileSass', 'compileJs'])
})

////////////////
