'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*'],
	scope: ['devDependencies']
});
var del = require('del');

// https://github.com/ai/autoprefixer.
// Default: > 1%, last 2 versions, Firefox ESR, Opera 12.1
// Android, BlackBerry or bb, iOS
// Chrome, Firefox or ff, Explorer or ie, Opera, Safari
// last 2 versions, last 2 Chrome versions, > 5%,
// ff > 20, ff >= 20, Firefox ESR, none
// Blackberry and stock Android browsers will not be used in last n versions. Add them by name:
// autoprefixer("last 1 version", "BlackBerry 10", "Android 4")
var AutoPrefixerConfig = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];
var path = require('path');
var server = require('tiny-lr')();
var sassRootPath = 'src/framework/';
var dist = 'framework';

// task: stripLRScript
// @describe    Strip out the LiveReload Script tag in HTML
gulp.task('stripLRScript', function() {
	return gulp.src(path.join(__dirname, 'index.html'))
		.pipe($.replace(/<script *src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
		.pipe(gulp.dest(path.join(__dirname, appName)));
});

// task: injectLRScript
// @describe    inject livereload script into index.html
gulp.task('injectLRScript', function() {
	return gulp.src(path.join(__dirname, 'index.html'))
		.pipe($.replace(/<script *src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
		.pipe($.replace(/<\/body>/,
				'<script src="http://localhost:35729/livereload.js?snipver=1"></script>\n</body>'))
		.pipe(gulp.dest(path.join(__dirname, appName)));
});

// @describe Remove the 'dist/' folder, start from a clean slate
gulp.task('clean', del.bind(null, [dist], {force: true}));

// Dependency Task
// Only run in the build process
// Based on the settings in framework/__init.sass, to output the RWD grid css
gulp.task('RWD_grid_builder', function() {
	return gulp.src( './static/styles/build/*.sass' )
		.pipe($.rubySass({
			compass: false,
			sourcemap: false,
			debugInfo: false,
			lineNumbers: false
		}))
		.pipe($.autoprefixer.apply( this, AutoPrefixerConfig ))
		.pipe(gulp.dest(path.join(__dirname, 'static/styles/build/')));
});

gulp.task('release', ['clean'], function(cb) {
	var srcFIles = [
		'./__init.sass',
		'./_controller.sass',
		'./_css2.sass',
		'./_grid.sass',
    './_utils.sass',
		'./components/**/*.sass'
	];
	// the base option sets the relative root for the set of files,
	// preserving the folder structure
	gulp.src(srcFIles, { cwd: 'src/framework/**' } )
		.pipe(gulp.dest( path.join(__dirname, dist, 'sass') ));

	gulp.src(['./src/reset.css'])
		.pipe( $.concat('reset.css') )
		.pipe(gulp.dest( path.join(__dirname, dist) ));

	cb();
});

gulp.task('sass', function() {
	var styleDestPath = 'static/styles';

	// style: nested (default), compact, compressed, or expanded.
	return $.rubySass(sassRootPath, {
	  sourcemap: true,
	  style:     'expanded',
	  loadPath:  [sassRootPath]
	})
	  .on('error', function (err) {
	    console.error('[Error]: ', err.message);
	  })
	  .pipe($.autoprefixer({
	    browsers: AutoPrefixerConfig
	  }))
	  .pipe($.sourcemaps.write('maps', {
	    includeContent: false,
	    sourceRoot:     styleDestPath
	  }))
	  .pipe(gulp.dest(styleDestPath));
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

function rebuildProject () {
  gulp.start('sass');
}

gulp.task('default', ['sass'], function() {
	server.listen(35729, function(err) {
		if (err) {
		  return gutil.log('\n[-log]', gutil.colors.red(err));
		}

		$.watch(sassRootPath + '**/*.{scss,sass}', rebuildProject);

		gulp.watch(appName + '/examples/refactor.html', notifyLivereload);
		gulp.watch(appName + '/resources/css/{,**/}*.css', notifyLivereload);
	});
});
