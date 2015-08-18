### Building Freddy

Freddy is developed without a compile/build step (i.e., plain ES5 Javascript, plain CSS files and HTML.) Builds are only performed for minified release versions. To run the development version locally, simply load `freddy/dev.html` into your browser, either from the desktop or through a local web server.

#### To build a minified release version:

Open a terminal and `cd` to the `freddy/build` directory.

Before you can build for the first time, do `npm install` to install the necessary uglify and clean-css modules. Eg:

	~/freddy/build$ npm install

Then a release version can be built from this directory. Eg:

	~/freddy/build$ node build.js

This will write `freddy/index.html` with all css and javascript files minimized and embedded into the single page. As an intermediate step, the files `freddy/js/freddy.min.js` and `freddy/css/style.min.css` are also generated. These files are not needed, they are only saved for convenience.

The build script scans `dev.html` for all `<script src>` tags. It will then load and minify all sources found, remove all script tags from the page, and append a single minified script block to the end of `<body>`. The minified script is enclosed in an IIFE to keep everything out of global scope.

(Note that the development sources each export one variable into global scope per file.)

It will also collect `<link>` tags for css files, minfy them and insert a `<style>` block into the `<head>`.

And it will find the `<img>` tag with logo.svg and replace it with the svg data inline.
