'use strict';
var gulp    = require('gulp');
var rename  = require('gulp-rename');
var clean   = require('gulp-clean');
var nodemon = require('gulp-nodemon');
var jshint  = require('gulp-jshint');
var sass    = require('gulp-sass');
var mocha   = require('gulp-mocha');

//Types of environments
var envs = {
    dev: 'dev',
    prod: 'prod'
};

var environment = process.env.ENVIRONMENT || envs.dev;

var dist = './dist';



var paths = {
    backendJS: './app/**/*.js',
    configDev: './config/config.dev.js',
    configProd: './config/config.prod.js',
    sass: './public/sass/**/*.scss',
    tests: './dist/test/**/*.js'
};

var sources = {
    server: './server.js',
    tests: './test'
};

var dest = {
    app: './dist/app',
    config: './dist/config',
    configName: 'config.js',
    css: './dist/public/css',
    server: './dist',
    tests: './dist/test'
};


//Tests/Linting

//Run mocha tests
gulp.task('mocha', ['test'], function(){
    return gulp.src(paths.tests, {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});

//Run jshint on our javascript files
gulp.task('jshint', function(){
    return gulp.src([paths.backendJS, paths.tests])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});



//Compilation/Moving Files/etc

//Compile Sass
gulp.task('sass', function() {
    return gulp.src(paths.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dest.css));
});

//Move node backend files ("app" folder)
gulp.task('app', function(){
    return gulp.src(paths.backendJS)
    .pipe(gulp.dest(dest.app));
});

gulp.task('server', function(){
    return gulp.src(sources.server)
    .pipe(gulp.dest(dest.server));
});

//Move node backend files ("app" folder)
gulp.task('test', function(){
    return gulp.src(sources.tests)
    .pipe(gulp.dest(dest.tests));
});

//Select a config file
gulp.task('config', function(){
    var src;
    if(environment === envs.dev){
        src = paths.configDev;
    } else if(environment === envs.prod){
        src = paths.configProd;
    } else {
        console.error('Unknown environment');
    }

    return gulp.src(src)
    .pipe(rename(dest.configName))
    .pipe(gulp.dest(dest.config));
});

//Runs tasks associated with moving or compiling code
gulp.task('compile', ['sass', 'app', 'config', 'test', 'server']);




//Delete dist folder
gulp.task('clean', function(){
    return gulp.src(dist)
    .pipe(clean());
});




//Run any tasks involved with building the code
gulp.task('build', ['jshint', 'compile', 'mocha']);

//Build and start server
gulp.task('default', ['build'], function(){
    nodemon({
        script: 'dist/server.js'
    });
});