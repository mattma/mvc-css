
/*  --------------------------------------------
    detection.js
    Based On: http://www.quirksmode.org/js/detect.html
    Matt Ma. -- Senior Web Developer ( mma@pushhere.com) 
    --------------------------------------------  */
    

/*  Object: Detection
    --------------------------------------------  */
    window.Detection = (function( window, document, undefined ) {
        
        Detection = { 
            
            init : function() {
                this.name = 'Detection Library';
                this.version = '1.0.0';

                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent)
                  || this.searchVersion(navigator.appVersion)
                  || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "an unknown operation system";

                this.scriptable();
            },

            scriptable : function(other) {
                if ( other === false
                    || !document.createTextNode
                    || !Array.prototype.push
                    || !Object.hasOwnProperty
                    || !document.createElement
                    || !document.getElementsByTagName
                ) {
                    return false;
                } 

                // HACKY, Pushing classes into an array for display
                var classes = [];
                classes.push(
                    this.browser 
                    + ' ' + this.browser+'-'+this.version 
                    + ' ' + this.OS 
                    + ' scriptable '
                    + document.documentElement.className
                );
                document.documentElement.className = classes; 
            },

            searchString : function (data) {
                for (var i=0;i<data.length;i++)  {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1)
                            return data[i].identity;
                    }
                    else if (dataProp)
                        return data[i].identity;
                } 
            },

            searchVersion : function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index+this.versionSearchString.length+1)); 
            },

            dataBrowser : [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {   string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                }, 
                {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    string: navigator.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "IE",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "RockMelt",
                    identity: "RockMelt" 
                }
            ],

            dataOS : [
                {
                  string: navigator.platform,
                  subString: "Win",
                  identity: "Windows"
                },
                {
                  string: navigator.platform,
                  subString: "Mac",
                  identity: "Mac"
                },
                {
                  string: navigator.userAgent,
                  subString: "iPhone",
                  identity: "iPhone/iPod"
                },
                {
                  string: navigator.userAgent,
                  subString: "iPad",
                  identity: "iPad"
                },
                {
                  string: navigator.platform,
                  subString: "Linux",
                  identity: "Linux"
                } 
            ]
        }    
        
        return Detection;
        
    })(this, this.document);
    
    Detection.init();