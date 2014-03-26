var gulp = require('gulp'),
    gutil = require('gulp-util'),
    plugins = require('gulp-load-plugins')();

// https://github.com/ai/autoprefixer. Default: > 1%, last 2 versions, Firefox ESR, Opera 12.1
// Android, BlackBerry or bb, iOS
// Chrome, Firefox or ff, Explorer or ie, Opera, Safari
//
// last 2 versions, last 2 Chrome versions, > 5%, ff > 20, ff >= 20, Firefox ESR, none
// Blackberry and stock Android browsers will not be used in last n versions. Add them by name:
// autoprefixer("last 1 version", "BlackBerry 10", "Android 4")
var AutoPrefixerConfig = ['last 2 version', '> 5%', 'ie >= 9', 'ios 6', 'android 4'];

var APP_CONFIG = require('./config.json'),
    path = require('path'),
    server = require('tiny-lr')(),
    compileAllSrc, // Compile all src if filename start with _, or single without leading _
    sassFilePath; // Used to dynamicially set sass path, default to all sass

// Local Variable
var appName = APP_CONFIG.applicationName,
    options = {
        hostname: 'localhost',
        port: 3001,
        senchaAppName: appName
    };

// task: lint
gulp.task('lint', function() {
    gulp.src('gulpfile.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

// task: package
gulp.task('package', function() {
    var stream = gulp.src(path.join(__dirname, appName, 'packager.json'))
        .pipe(plugins.replace(/"applicationId"(?:\s+)?:(?:\s+)?"\s*(.*?)\s*"/, '"applicationId": "' + APP_CONFIG.applicationId + '"'))
        .on('end', function() {
            gutil.log('\n[-log]', 'applicationId: ', gutil.colors.cyan(APP_CONFIG.applicationId));
        })

    .pipe(plugins.replace(/"bundleSeedId"(?:\s+)?:(?:\s+)?"\s*(.*?)\s*"/, '"bundleSeedId": "' + APP_CONFIG.bundleSeedId + '"'))
        .on('end', function() {
            gutil.log('\n[-log]', 'bundleSeedId: ', gutil.colors.cyan(APP_CONFIG.bundleSeedId));
        })

    .pipe(plugins.replace(/"inputPath"(?:\s+)?:(?:\s+)?"\s*(.*?)\s*"/, '"inputPath": "' + APP_CONFIG.inputPath + '"'))
        .on('end', function() {
            gutil.log('\n[-log]', 'inputPath: ', gutil.colors.cyan(APP_CONFIG.inputPath));
        })

    .pipe(plugins.replace(/"outputPath"(?:\s+)?:(?:\s+)?"\s*(.*?)\s*"/, '"outputPath": "' + APP_CONFIG.outputPath + '"'))
        .on('end', function() {
            gutil.log('\n[-log]', 'outputPath: ', gutil.colors.cyan(APP_CONFIG.outputPath));
        })

    .pipe(plugins.replace(/"platform"(?:\s+)?:(?:\s+)?"\s*(.*?)\s*"/, '"platform": "' + APP_CONFIG.platform + '"'))
        .on('end', function() {
            gutil.log('\n[-log]', 'platform: ', gutil.colors.cyan(APP_CONFIG.platform));
        })

    .pipe(plugins.replace(/"provisionProfile"(?:\s+)?:(?:\s+)?"\s*(.*?)\s*"/, '"provisionProfile": "' + APP_CONFIG.provisionProfile + '"'))
        .on('end', function() {
            gutil.log('\n[-log]', 'provisionProfile: ', gutil.colors.cyan(APP_CONFIG.provisionProfile));
            gutil.log(' ');
        })

    .pipe(gulp.dest(path.join(__dirname, appName)));

    gutil.log('\n[-log]', gutil.colors.cyan(appName + '/packager.json'), 'has been updated with those values: ');
    gutil.log('----------------------------------------------------------');

    return stream;
});

// task: stripLRScript
// @describe    Strip out the LiveReload Script tag in HTML
gulp.task('stripLRScript', function() {
    return gulp.src(path.join(__dirname, appName, 'index.html'))
        .pipe(plugins.replace(/<script *src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
        .pipe(gulp.dest(path.join(__dirname, appName)));
});

// task: injectLRScript
// @describe    inject livereload script into index.html
gulp.task('injectLRScript', function() {
    return gulp.src(path.join(__dirname, appName, 'index.html'))
        .pipe(plugins.replace(/<script *src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
        .pipe(plugins.replace(/<\/body>/,
            '<script src="http://localhost:35729/livereload.js?snipver=1"></script>\n</body>'))
        .pipe(gulp.dest(path.join(__dirname, appName)));
});

// task: gen
// @describe    generate an model,view,store,controller from base template
// @usage       $-  gulp gen --type model --path matt/test
// @flag        --type model
// @flag        --path path/to/folder[.js]
gulp.task('gen', function() {
    var taskGen = require('./server/tasks/task-gen'),
        type = taskGen.type,
        filepathPlain = taskGen.filepathPlain,

        filepath = filepathPlain + '.js',
        destPath = path.join(__dirname, appName, 'app', type),
        namespace = appName + '.' + type + '.' + filepathPlain.replace(/\//g, '.');

    return gulp.src(path.join(__dirname, 'server/skeletons', type + '.js'))
        .pipe(plugins.replace(/\*NAMESPACE\*/, namespace))
        .on('end', function() {
            gutil.log('\n[-log]', 'Generate a new file at ', gutil.colors.green(appName + '/app/' + type + '/' + filepath));
        })
        .pipe(plugins.rename(filepath))
        .on('end', function() {
            gutil.log('\n[-log]', gutil.colors.green(type), ' class name is ', gutil.colors.green(namespace));
            gutil.log(' ');
        })
        .pipe(gulp.dest(destPath));
});

// task: setup
// @describe First Task to run. Setup app config. Would be triggered in 3 different condition logic
// Condition 1: user pass an appName flag
// Condition 2: user does not have an application folder
// Condition 3: user already ahve an application folder
// @usage       $-  gulp setup --name Awesome
// @flag        --name App_Name
gulp.task('setup', function (cb) {
    require('./server/tasks/task-setup')(cb);
});

// Smart compile: if filename start with _, when save it will compile the whole project.
// if filename is all text without _, when save it will only compile changed file
gulp.task('sass', function() {
    var allSrc = appName + '/resources/sass/{,**/}*.{scss,sass}',
        compileFiles = ( compileAllSrc ) ? allSrc : ( sassFilePath ) ? sassFilePath : allSrc,
        nestedFolder = void 0;

    // When it is single file for compiling, it needs to render it in the right folder path.
    // default it is   appName +'/resources/css',
    // If it is nested folder inside sass/path/to/compileFilename, it will alert the dest folder path
    if ( !compileAllSrc ) {
        var basepathArr = path.dirname(sassFilePath).split('/'),
            len = basepathArr.length,
            lastPos = len -1,
            sassPos = basepathArr.indexOf('sass');

        if ( len > sassPos ) {
            nestedFolder = '';
            var diff = lastPos - sassPos;
            for ( var i = 0 ; i < diff; i++ ) {
                var foldername = '/' + basepathArr[ lastPos - i ];
                nestedFolder = foldername.concat(nestedFolder);
            }
        }
    }
    var destPath = appName +'/resources/css' + ( ( nestedFolder ) ? nestedFolder : '' );

    return gulp.src( compileFiles )
        .pipe(plugins.rubySass({
            compass: true,
            sourcemap: true
        }))
        .pipe(plugins.autoprefixer.apply( this, AutoPrefixerConfig ))
        .pipe(gulp.dest( destPath ))
        .pipe(plugins.notify({ message: 'Compiled <%= file.relative %>' }));
});

// https://github.com/sindresorhus/gulp-imagemin
// ~0.1.5 does not support stream yet. cannot resave to the same folder
gulp.task('imagemin', function() {
    var imgSrc = appName + '/resources/images-original/{,**/}*.{png,jpeg,jpg,gif}',
        imgDst =appName + '/resources/images/';

    return gulp.src(imgSrc)
        .pipe(plugins.changed(imgDst))
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(imgDst));
});

// task: express
gulp.task('express', function() {
    require('./server/app')(options);
});

gulp.task('open', function () {
    var url = 'http://' + options.hostname + ':' + options.port;
    return gulp.src( appName + '/index.html')
                .pipe(plugins.open('', { url: url }) );
});

// Notifies livereload of changes detected by `gulp.watch()`
function notifyLivereload(event) {
    // `gulp.watch()` events provide an absolute path
    //  make it relative path. Both relative and absolute should work
    var fileName = path.relative(__dirname, event.path);

    server.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task('default', ['sass', 'express', 'injectLRScript'], function() {
    gulp.start('open');
    gulp.watch(appName + '/resources/sass/{,**/}*.{scss,sass}', function(event) {
        sassFilePath = event.path; // Only pass changed file to the sass task
        var basename = path.basename(sassFilePath);
        compileAllSrc = ( basename.indexOf('_') > -1 ) ? true : false;
        gulp.start('sass');
    });

    server.listen(35729, function(err) {
        if (err) { return gutil.log('\n[-log]', gutil.colors.red(err)); }

        gulp.watch(appName + '/index.html', notifyLivereload);
        gulp.watch(appName + '/app.js', notifyLivereload);
        gulp.watch(appName + '/app/{,**/}*.js', notifyLivereload);
        gulp.watch(appName + '/resources/css/{,**/}*.css', notifyLivereload);
    });
});
