# Custom Cakefile handcrafted by Matt Ma.
# Copyright©2012 Matt Ma Design
# Senior Web Developer -- Matt Ma. ( matt@mattmadesign.com )
# http://www.mattmadesign.com

fs     = require 'fs'
{spawn, exec} = require 'child_process'
{print} = require 'util'
util = require 'util'

# https://github.com/jashkenas/coffee-script/wiki/%5BHowTo%5D-Compiling-and-Setting-Up-Build-Tools
# https://github.com/jashkenas/coffee-script/blob/master/Cakefile#L21


# ****************************************  README HOW TO USE   ****************************************

# use "cake watch"             Watch file changes and Complie each coffee file in /coffee/ folder, output to /mylibs/ folder
# use "cake compile"          Complie each coffee file in the /coffee/ folder, output to /mylibs/ folder

# use "cake -n 'folder_name/file_name' uglify
	#Note: Pass file path as parameter. NO '.js' and end '/' after fileName! minify single file output to /production/

# Use "cake uglifycoffeeeach" Minify each coffee files in "coffeeFileNames" array, output each file to /production/ folder.
	#Note: Coffee files from /coffee/ folder, Need to manually insert the file name into the array

# Use "cake uglifycoffeeone"  Build coffee files in "coffeeFileNames" array into one master file, then minify single file output to /production/ folder ( application.min.js ).
	#Note: Coffee files from /coffee/ folder, Need to manually insert the file name into the array

# Use "cake uglifycoffeeall"  Build every coffee files in /coffee/ folder into one master file, then minify it and output to /production/ folder ( application.min.js ).
	#Note: No actions needed. Auto search coffee files.

# Use "cake uglifyjseach"     Minify each js files in "jsFileNames" array, output each file to /production/ folder.
	#Note: JS files from /mylibs/ folder, Need to manually insert the file name into the array

# Use "cake uglifyjsone"      Build js files in "jsFileNames" array into one master file, then minify single file output to /production/ folder ( application.min.js ).
	#Note: JS files from /mylibs/ folder, Need to manually insert the file name into the array

# Use "cake uglifyjsall"        Build every js files in /mylibs/ folder into one master file, then minify it and output to /production/ folder ( application.min.js ).
	#Note: No actions needed. Auto search coffee files.

# Use "cake credit"              Add Editable Credit info to every JS file in the /production/ folder. Note: Work indepentant'

# Use "cake minify'              Minify files after build using Google's Closure Compiler. It is not ready to use. Edit the functions if needed.


# ****************************************  EDIT CUSTOM VALUES FOR PROJECT  ****************************************

wordpress = false
themeName = "wptheme"
# insert file name without .coffee inside scripts/coffee/ folder.
# One line per file name. They will process to minify.
coffeeFileNames  = [
	"init"
]
# insert file name without .js inside scripts/mylibs/ folder.
# Works with "cake uglifyjseach" function ONLY, to minify each regular JS files
# One line per file name. They will process to minify.
jsFileNames  = [
	"plugins"
]
# Insert credit info at the end of the files in the production folder
# Works with "cake credit" function ONLY
# First line need to keep it empty so that it will create a new line for where the comments start
creditInfo = """

/* Javascript for ProjectName */
/* Version 1.0 modified on ${DATE} ${TIME} */
/* Copyright©2012 Matt Ma Design */
/* Senior Web Developer -- Matt Ma. ( matt@mattmadesign.com ) */
/* http://www.mattmadesign.com */
"""


# ****************************************    DONOT EDIT ANYTHING BELOW     ****************************************

wp_path = "wp-content/themes/#{themeName}"

watchMethod = '-bwco'
compileMethod = '-bco'

output = if wordpress then "#{wp_path}/static/scripts/libs" else 'static/scripts/libs'
source = if wordpress then "#{wp_path}/static/scripts/coffee" else 'static/scripts/coffee'
scripts = if wordpress then "#{wp_path}/static/scripts" else 'static/scripts'

master = "#{source}/master"
production = if wordpress then "#{wp_path}/static/scripts/production" else "static/scripts/production"

watch = (callback) ->
	coffee = spawn 'coffee', [ watchMethod, output, source ]
	coffee.stderr.on 'data', (data) ->
		process.stderr.write data.toString()
	coffee.stdout.on 'data', (data) ->
		print data.toString()
	coffee.on 'exit', (code) ->
		callback?() if code is 0

task 'watch', 'Watch and Complie each coffee file in /coffee/', -> watch()


task 'compile', 'Complie each coffee file in /coffee/', ->
	exec "coffee #{compileMethod} #{output} #{source}", (err, stdout, stderr) ->
		if err then handleError(err) else util.log "Done! Compiled each coffee file in /coffee/ folder, output to /mylibs/ folder"


option '-n', '--folder [FILE_NAME]', "set the folder/filename for 'cake uglify' to compile. Note: Must be .js file, NO '/' and '.js' after fileName!"


task 'uglify', "cake -n 'folder_name/file_name' uglify; Note: NO '.js' and end '/' after fileName! minify output to /production/'", (options)->
	path = "#{options.folder}"   # path equal to the custom paramter which user insert in
	ind = path.lastIndexOf("/")  # find the index of the last instance of the "/" forward slash. Right before the fileName
	len = path.length            # total length of the file path
	fileName = path.substring(ind+1, len) # Find the beginning of the fileName index, end at file path end

	jsp = uglify.parser
	pro = uglify.uglify

	fs.readFile "#{scripts}/#{options.folder}.js", 'utf8', (err, fileContents) ->
		ast = jsp.parse fileContents # parse code and get the initial AST
		ast = pro.ast_mangle ast # get a new AST with mangled names
		ast = pro.ast_squeeze ast # get an AST with compression optimizations
		final_code = pro.gen_code ast # compressed code here

		fs.writeFile "#{production}/#{fileName}.min.js", final_code, (err)-> if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Uglified /#{options.folder}.js output to /production/#{fileName}.min.js"


task 'uglifycoffeeeach', 'Minify each coffee files in array, output to /production/ folder', ->
	appContents = new Array
	for file, index in coffeeFileNames then do (file, index) ->
		fs.readFile "#{source}/#{file}.coffee", 'utf8', (err, fileContents) ->
			handleError(err) if err
			appContents[index] = fileContents
			process("#{file}")
	process = (coffeeFileName)->
		exec "coffee #{compileMethod} #{master} #{source}/#{coffeeFileName}.coffee", (err, stdout, stderr) ->
			if err then handleError(err) else uglifyNow("#{coffeeFileName}") #util.log "Build the concat file at #{master} folder."
	uglifyNow = (fileName)->
		jsp = uglify.parser
		pro = uglify.uglify

		fs.readFile "#{master}/#{fileName}.js", 'utf8', (err, fileContents) ->
			ast = jsp.parse fileContents # parse code and get the initial AST
			ast = pro.ast_mangle ast # get a new AST with mangled names
			ast = pro.ast_squeeze ast # get an AST with compression optimizations
			final_code = pro.gen_code ast # compressed code here

			fs.writeFile "#{production}/#{fileName}.min.js", final_code
			fs.unlink "#{master}/#{fileName}.js", (err) ->  # Remove the master.js file from the master folder
				if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Uglified /coffee/#{fileName}.coffee output to /production/#{fileName}.min.js"


task 'uglifycoffeeone', 'Build coffee files in array into one file and minify output to /production/ folder', ->
	appContents = new Array
	remaining = coffeeFileNames.length
	for file, index in coffeeFileNames then do (file, index) ->
		fs.readFile "#{source}/#{file}.coffee", 'utf8', (err, fileContents) ->
			handleError(err) if err
			appContents[index] = fileContents
			process() if --remaining is 0
	process = ->
		fileName = "application"
		fs.writeFile "#{master}/#{fileName}.coffee", appContents.join('\n\n'), 'utf8', (err) ->
			handleError(err) if err
			exec "coffee --compile #{master}/#{fileName}.coffee", (err, stdout, stderr) ->
				handleError(err) if err
				uglifyNow("#{fileName}") if --remaining < 0
				fs.unlink "#{master}/#{fileName}.coffee", (err) ->
					if err then handleError(err) else util.log "Build the single master file output to /coffee/master/#{fileName}.js."
	uglifyNow = (fileName)->
		jsp = uglify.parser
		pro = uglify.uglify

		fs.readFile "#{master}/#{fileName}.js", 'utf8', (err, fileContents) ->
			ast = jsp.parse fileContents # parse code and get the initial AST
			ast = pro.ast_mangle ast # get a new AST with mangled names
			ast = pro.ast_squeeze ast # get an AST with compression optimizations
			final_code = pro.gen_code ast # compressed code here

			fs.writeFile "#{production}/#{fileName}.min.js", final_code
			fs.unlink "#{master}/#{fileName}.js", (err) ->  # Remove the master.js file from the master folder
				if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Remove the source file /coffee/master/#{fileName}.js! Uglified output to /production/#{fileName}.min.js."


task 'uglifycoffeeall', 'Build every coffee files in /coffee/ and output 1 minify file to /production/', ->
	pattern = /(.coffee)$/
	appContents = new Array  #This array will store the file content
	arrayCount = new Array   #This array will only store the js file index number. ignore folder or invilid files into the array
	count = 0
	fs.readdir "#{source}/", (err, files) ->
		for file, index in files then do (file, index) ->
			if pattern.test(file)
				fs.readFile "#{source}/#{file}", 'utf8', (err, fileContents) ->
					if err
						handleError(err)
					else
						appContents[index] = fileContents
						arrayCount.push "index" # add text into the arrayCount index for correct array length value
						process()

	process = ->
		fileName = "application"
		fs.writeFile "#{master}/#{fileName}.coffee", appContents.join('\n\n'), 'utf8', (err) ->
			if err
				handleError(err)
			else
				count++
				if count is arrayCount.length
					exec "coffee --compile #{master}/#{fileName}.coffee", (err, stdout, stderr) ->
						if err
							handleError(err)
						else
							uglifyNow("#{fileName}")
							fs.unlink "#{master}/#{fileName}.coffee", (err) ->
								if err then handleError(err) else util.log "Build the single master file output to /coffee/master/#{fileName}.js."

	uglifyNow = (fileName)->
		jsp = uglify.parser
		pro = uglify.uglify

		fs.readFile "#{master}/#{fileName}.js", 'utf8', (err, fileContents) ->
			ast = jsp.parse fileContents # parse code and get the initial AST
			ast = pro.ast_mangle ast # get a new AST with mangled names
			ast = pro.ast_squeeze ast # get an AST with compression optimizations
			final_code = pro.gen_code ast # compressed code here

			fs.writeFile "#{production}/#{fileName}.min.js", final_code
			fs.unlink "#{master}/#{fileName}.js", (err) ->  # Remove the master.js file from the master folder
				if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Remove the source file /coffee/master/#{fileName}.js! Uglified output to /production/#{fileName}.min.js."


task 'uglifyjseach', 'Minify each js files in array, output to /production/ folder.', ->
	jsp = uglify.parser
	pro = uglify.uglify

	for file, index in jsFileNames then do (file, index) ->
		fs.readFile "#{output}/#{file}.js", 'utf8', (err, fileContents) ->
			ast = jsp.parse fileContents # parse code and get the initial AST
			ast = pro.ast_mangle ast # get a new AST with mangled names
			ast = pro.ast_squeeze ast # get an AST with compression optimizations
			final_code = pro.gen_code ast # compressed code here

			fs.writeFile "#{production}/#{file}.min.js", final_code, (err)-> if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Uglified /mylibs/#{file}.js output to /production/#{file}.min.js"


task 'uglifyjsone', 'Build js files in array into 1 master js, output 1 minify file to /production/', ->
	appContents = new Array
	count = 0
	for file, index in jsFileNames then do (file, index) ->
		fs.readFile "#{output}/#{file}.js", 'utf8', (err, fileContents) ->
			handleError(err) if err
			appContents[index] = fileContents
			process("#{file}")

	process = (jsFileName)->
		fileName = "application"
		fs.writeFile "#{master}/#{fileName}.js", appContents.join('\n\n'), 'utf8', (err) ->
			if err
				handleError(err)
			else
				count++
				util.log "NOTE: Concat #{jsFileName} file in 'jsFileNames' array output to /production/#{fileName}.js"
				uglifyNow("#{fileName}") if count is appContents.length-1

	uglifyNow = (fileName)->
		jsp = uglify.parser
		pro = uglify.uglify

		fs.readFile "#{master}/#{fileName}.js", 'utf8', (err, fileContents) ->
			ast = jsp.parse fileContents # parse code and get the initial AST
			ast = pro.ast_mangle ast # get a new AST with mangled names
			ast = pro.ast_squeeze ast # get an AST with compression optimizations
			final_code = pro.gen_code ast # compressed code here

			fs.writeFile "#{production}/#{fileName}.min.js", final_code
			fs.unlink "#{master}/#{fileName}.js", (err) ->  # Remove the application.js file from the master folder
				if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Uglify 'jsFileNames' array js output to /production/#{fileName}.min.js."


task 'uglifyjsall', 'Build every js files in /mylibs/ folder into 1 file, minify, output to /production/', ->
	pattern = /(.js)$/
	appContents = new Array  #This array will store the file content
	arrayCount = new Array   #This array will only store the js file index number. ignore folder or invilid files into the array
	count = 0
	fs.readdir "#{output}/", (err, files) ->
		for file, index in files then do (file, index) ->
			if pattern.test(file)
				fs.readFile "#{output}/#{file}", 'utf8', (err, fileContents) ->
					if err
						handleError(err)
					else
						appContents[index] = fileContents
						arrayCount.push "index" # add text into the arrayCount index for correct array length value
						process("#{file}")

	process = (jsFileName)->
		fileName = "application"
		fs.writeFile "#{master}/#{fileName}.js", appContents.join('\n\n'), 'utf8', (err) ->
			if err
				handleError(err)
			else
				count++
				util.log "NOTE: Concat #{jsFileName} file in 'jsFileNames' array output to /production/#{fileName}.js"
				uglifyNow("#{fileName}") if count is arrayCount.length

	uglifyNow = (fileName)->
		jsp = uglify.parser
		pro = uglify.uglify

		fs.readFile "#{master}/#{fileName}.js", 'utf8', (err, fileContents) ->
			ast = jsp.parse fileContents # parse code and get the initial AST
			ast = pro.ast_mangle ast # get a new AST with mangled names
			ast = pro.ast_squeeze ast # get an AST with compression optimizations
			final_code = pro.gen_code ast # compressed code here

			fs.writeFile "#{production}/#{fileName}.min.js", final_code
			fs.unlink "#{master}/#{fileName}.js", (err) ->  # Remove the application.js file from the master folder
				if err then handleError(err) else util.log "NOTE: CHANGE JS FilePath in HTML. Concat all js files from /mylibs/ folder output 1 master min file to /production/#{fileName}.min.js."


task 'credit', 'Write Credit info to end of every JS files in /production/ folder', ->
	pattern = /(.js)$/
	fs.readdir "#{production}/", (err, files) ->
		for file, index in files then do (file, index) ->
			if pattern.test(file)
				fs.open "#{production}/#{file}", "a", 666, (err, id) ->
					if err
						handleError(err)
					else
						fs.write id, creditInfo, null, 'utf8', ->
							fs.close id, (err)-> if err then handleError(err) else util.log "NOTE:  /production/#{file} has been modified."


task 'minify', 'Minify the resulting application file after build using Google\'s Closure Compiler', ->
	exec "java -jar #{master}/compiler.jar --js #{master}/master.js --js_output_file #{production}/application.min.js", (err, stdout, stderr) ->
		fs.unlink "#{master}/master.js", (err) -> # Remove the master.js file from the master folder
			if err then handleError(err) else util.log "NOTE: CHANGE the JS path in HTML. Google Compiler #{production}/application.min.js."


handleError = (error) ->
	util.log error
