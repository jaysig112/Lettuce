'use strict';
var gulp          = require('gulp');
var rename        = require('gulp-rename');
var clean         = require('gulp-clean');
var spawn         = require('child_process').spawn;
var runSequence   = require('run-sequence');
var jshint        = require('gulp-jshint');
var sass          = require('gulp-sass');
var mocha         = require('gulp-mocha');
var exec          = require('child_process').exec;

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
    frontendJS: './public/js/**/*.js',
    frontendHTML: './public/views/**/*.html',
    sass: './public/sass/**/*.scss',
    tests: './dist/test/**/*.js'
};

var sources = {
    env: '.env',
    frontEnd: './public/**/*',
    server: './server.js',
    tests: './test/**/*.js',
    runUpdates: './runUpdates.js',
    passportConfig: './config/passport.js'
};

var dest = {
    app: './dist/app',
    config: './dist/config',
    configName: 'config.js',
    css: './dist/public/css',
    env: './dist',
    frontEnd: './dist/public',
    server: './dist',
    tests: './dist/test',
    runUpdates: './dist',

};


//Tests/Linting

//Run mocha tests
gulp.task('mocha', ['compile'], function(){
    return gulp.src(paths.tests, {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});

//Run jshint on our javascript files
var jshintPaths = [paths.backendJS, paths.tests, paths.frontendJS];
gulp.task('jshint', function(){
    return gulp.src(jshintPaths)
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

gulp.task('frontEnd', function(){
    return gulp.src(sources.frontEnd)
    .pipe(gulp.dest(dest.frontEnd));
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

//Move runUpdate file
gulp.task('moveRunUpdates', function(){
    return gulp.src(sources.runUpdates)
    .pipe(gulp.dest(dest.runUpdates));
});

//Move env file
gulp.task('env', function(){
    return gulp.src(sources.env)
    .pipe(gulp.dest(dest.env));
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

gulp.task('config-passport', function(){
    return gulp.src(sources.passportConfig)
    .pipe(gulp.dest(dest.config));
});

//Runs tasks associated with moving or compiling code
gulp.task('compile', ['sass', 'app','config-passport', 'config', 'test', 
  'frontEnd', 'server', 'moveRunUpdates']);




//Delete dist folder
gulp.task('clean', function(){
    return gulp.src(dist)
    .pipe(clean());
});



gulp.task('watch', function() {
    gulp.watch(paths.sass, function(){
        runSequence('sass', 'startServer');
    });

    gulp.watch(jshintPaths, ['jshint']);

    gulp.watch(paths.backendJS, function(){
        runSequence('app', 'startServer');
    });

    gulp.watch(sources.server, function(){
        runSequence('server', 'startServer');
    });

    gulp.watch(sources.frontEnd, function(){
        runSequence('frontEnd', 'startServer');
    });
});

//Run any tasks involved with building the code
gulp.task('build', ['jshint', 'compile', 'mocha']);

//Build and start server
gulp.task('default', ['build']);


gulp.task('run', function(){
    runSequence(
        'build',
        'startServer',
        'watch'
    );
});


var nodeInstance;
gulp.task('startServer', function(){
    if (nodeInstance){
        nodeInstance.kill();    
    } 

    nodeInstance = spawn('node', ['dist/server.js'], {stdio: 'inherit'});

    nodeInstance.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('runUpdates', ['moveRunUpdates','config','app'], function(cb){
    exec('node dist/runUpdates', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});
