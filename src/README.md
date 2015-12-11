## Features

1. Arguments which pass into mixin could be either quoted or non-quoted ( except image paths )

2. Learning new syntax. Maintainable, Smart, Magic.

- e.g.  text-transform: capitalize
	=>  +ttransform(c)
	even better, by default,  +ttransform  take capitalize as a default value

- e.g.  font-size: 1.6em
	=>  +fsize(1.6)  by default, it uses em as default measurement
	even better, you could pass px, em, % explicitly.  +fsize(120%)
	Based on my experience, I opinionalize the measurement as default, and it could be overwrited by passing argument
	If you do not know what measure it is the best practice, just leave out the measurement, framework will fill it for you


3. Color value is fun to play with

	All browsers use different magnizim to implement hex color value. The best practice to get the accurate color value is
to use rgb value. So most of time, I have to do   color: rgb(51,51,51)   =>   +color(51 51 51)

	+color() mixin take one argument, it could be hex color value, color keyword, rgb value, hsl value, or an array of 3 value
in r g b order


4. Pseudo Class is super easy to work with

- e.g.  &:hover
	=>  +hover  take a block of CSS rules

- e.g.  &:nth-child(3)
	=>	 +child(3)  take a block of CSS rules
	=>  +child(1) || +child(f)  || +child(first)

- e.g. @media only screen and (max-width : 320px)
	+media($media)  take keyword for CSS3 Media Queries like   desktop, wide-screens, mobile, retina, mobile-portrait, mobile-landscape, tablet, etc.

	You won't need to remember all the CSS3 Media Queries Syntax, and just need to call the mixin, pass the keyword what media you are trying to target. then apply a lock of CSS rules. Then it enabled the developer apply the regular css rule and different media queries in one area, easy to maintain in the long run.


5. Image Sprite Generation with no effort needed

6. Easy to add your own shortcut to the framework based on your personal perference. Edit the file: _default_settings.sass

7. Fully support CSS3 easy to use @media query, CSS3 animations, transitions, gracefully fall back in Non-Modern browsers

8. More than 40 different KeyFrame name could be used in the CSS3 animation
