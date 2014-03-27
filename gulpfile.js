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

var path = require('path'),
    server = require('tiny-lr')(),
    compileAllSrc, // Compile all src if filename start with _, or single without leading _
    sassFilePath; // Used to dynamicially set sass path, default to all sass

// task: lint
gulp.task('lint', function() {
    gulp.src('gulpfile.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

// task: stripLRScript
// @describe    Strip out the LiveReload Script tag in HTML
gulp.task('stripLRScript', function() {
    return gulp.src(path.join(__dirname, 'index.html'))
        .pipe(plugins.replace(/<script *src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
        .pipe(gulp.dest(path.join(__dirname, appName)));
});

// task: injectLRScript
// @describe    inject livereload script into index.html
gulp.task('injectLRScript', function() {
    return gulp.src(path.join(__dirname, 'index.html'))
        .pipe(plugins.replace(/<script *src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
        .pipe(plugins.replace(/<\/body>/,
            '<script src="http://localhost:35729/livereload.js?snipver=1"></script>\n</body>'))
        .pipe(gulp.dest(path.join(__dirname, appName)));
});

// Smart compile: if filename start with _, when save it will compile the whole project.
// if filename is all text without _, when save it will only compile changed file
gulp.task('sass', function() {
    // @TODO
    // global pattern should be with two stars, but currently it is generated twice for the base.sass file
    //  './static/styles/sass/{,**/}*.{scss,sass}',
    var allSrc = './static/styles/sass/{,*/}*.{scss,sass}',
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
    var destPath = './static/styles' + ( ( nestedFolder ) ? nestedFolder : '' );

    return gulp.src( compileFiles )
        .pipe(plugins.rubySass({
            compass: true,
            sourcemap: true,
            debugInfo: false,
            lineNumbers: false
        }))
        .pipe(plugins.autoprefixer.apply( this, AutoPrefixerConfig ))
        .pipe(gulp.dest( destPath ))
        .pipe(plugins.notify({ message: 'Compiled <%= file.relative %>' }));
});

// https://github.com/sindresorhus/gulp-imagemin
// ~0.1.5 does not support stream yet. cannot resave to the same folder
gulp.task('imagemin', function() {
    var imgSrc = './static/images/{,**/}*.{png,jpeg,jpg,gif}',
        imgDst = './static/images/';

    return gulp.src(imgSrc)
        .pipe(plugins.changed(imgDst))
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(imgDst));
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

gulp.task('default', ['sass'], function() {
    gulp.watch('./static/styles/sass/{,**/}*.{scss,sass}', function(event) {
        sassFilePath = event.path; // Only pass changed file to the sass task
        var basename = path.basename(sassFilePath);
        compileAllSrc = ( basename.indexOf('_') > -1 ) ? true : false;
        gulp.start('sass');
    });

    server.listen(35729, function(err) {
        if (err) { return gutil.log('\n[-log]', gutil.colors.red(err)); }

        gulp.watch(appName + '/examples/refactor.html', notifyLivereload);
        gulp.watch(appName + '/resources/css/{,**/}*.css', notifyLivereload);
    });
});
