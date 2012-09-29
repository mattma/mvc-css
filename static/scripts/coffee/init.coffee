# Javascript for ProjectName
# Version 1.0 modified on ${DATE} ${TIME}
# Copyright©2012 Matt Ma Design
# Senior Web Developer -- Matt Ma. ( matt@mattmadesign.com )
# http://www.mattmadesign.com

# Use local alias
$ = jQuery

($ document).ready -> # DOM Ready Function

	$.localScroll
		target: 'body' # could be a selector or a jQuery object too.
		queue: true
		duration: 600

