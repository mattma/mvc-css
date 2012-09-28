/**
* Trigger placeholder value for the input field
*/
function activatePlaceholders() {
	var detect = navigator.userAgent.toLowerCase();
	if (detect.indexOf("safari") > 0) return false;
	var inputs = document.getElementsByTagName("input");
	for (var i=0;i<inputs.length;i++) {
		if (inputs[i].getAttribute("type") == "text") {
			if (inputs[i].getAttribute("placeholder") && inputs[i].getAttribute("placeholder").length > 0) {
				inputs[i].value = inputs[i].getAttribute("placeholder");
				inputs[i].onclick = function() {
					if (this.value == this.getAttribute("placeholder")) {
						this.value = "";
					}
					return false;
				}
				inputs[i].onblur = function() {
					if (this.value.length < 1) {
						this.value = this.getAttribute("placeholder");
					}
				}
			}
		}
	}
}

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
	(function() {
		var noop = function() {};
		var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
		var length = methods.length;
		var console = window.console = {};
		while (length--) {
				console[methods[length]] = noop;
		}
	}());
}
