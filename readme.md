# Freddy: A fast mobile Reddit reader

Freddy is a mobile Reddit reader web app designed to run fast and smooth like a native app. It supports modern browsers only.

### > [Launch Freddy](https://freddy.spacejack.ca/)

> **iOS users:** Freddy works better when launched in a new tab or when added to the homescreen so that Safari's swipe navigation won't navigate away from the app/page.

### Using Freddy

* Slide the main panel right to choose Subreddits and other options.
* Slide left for sidebar content.
* Tap image thumbnails to view fullscreen.
* Tap comment counts to read comments and self post content.
* Tap white article links to read self posts in-app.
* Tap blue article links to view off-site content in a new browser tab.
* Options and subscribed Subreddits are saved in a cookie when the options panel is closed.
* You can delete your preferences cookie by de-selecting "Save preferences in cookie", then closing the options panel. Reload the app and all Subreddits and options will be reset to defaults.
* Enabling the "back button" option on iOS may cause undesirable behaviour with Safari's swipe navigation.

---

### About Freddy

Freddy started out as an experiment to see if native-like speed could be achieved with mobile browsers. It relies on a few simple techniques for speed and smoothness:

* Let the browser scroll content itself in a scrollable div.
* All other animations are done with the CSS `transform` and `opacity` styles, using `requestAnimationFrame`.
* Never "render" (build or change DOM layout) during animations.
* Use CSS `flex` style for layout simplicity and consistency across browsers.
* Build specifically for mobile. Don't attempt to be a responsive or one-size-fits all solution.
* Hide rendering, then fade/animate-in when done. This may not be faster, but appears smoother and more "in control" to the user than watching the DOM construct itself.
* Don't support outdated browsers missing key features like `flex` or `transform`.

### Challenges

There were fewer browser technology or incompatibility roadblocks than I thought there would be overall, but a few things:

* On iOS, swipe navigation (and Safari's interference with user input events in general) are very problematic for any web app that wants to implement its own left/right sliding or swiping mechanics. At best you can coax the user to open in a new tab or launch from their homescreen so they won't inadvertently swipe the app away. Implementing the browser's history API is additionally problematic because of this. (The "back button" option is disabled in Freddy by default when running on iOS.)
* Chrome's new refresh-on-pull feature requires work to either prevent or deal with using location hashes.
* Safari flex and transform styles are still beta in iOS 8 so you still have to use the beta names for them. Eg., determine the name used for `transform` on startup.
* Safari needs the `-webkit-overflow-scrolling:touch` style applied to any div you want to scroll smoothly.
* Use `-webkit-tap-highlight-color: rgba(0, 0, 0, 0)` to disable highlighting on tap. Highlighting can cause some minor 'jank' when sliding panels on Chrome, just enough to irritate.
* Even with the new flex styles, some CSS positioning rules still drive me crazy.
* Browsers need a proper, standard Pointer API. Dealing with "echoed" touch and mouse events on mobile is ugly.
* Installing to homescreen process needs refinement on both the browser UI side and on the API side. Chrome should implement `navigator.standalone`.

### Code

Freddy started out as an low-level experiment with some sliding panels and scrollable content. It doesn't (yet) use any 3rd party libraries apart from the minifiers used by its build script. (You might think you see some jQuery in there, but it's actually just my own utility library that resembles jQuery element selectors.)

Check the build directory and readme for details on building the minified app. Freddy was written using vanilla ES5 and CSS.
