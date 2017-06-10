# Freddy

Freddy is a mobile Reddit reader web app designed to run fast and smooth like a native app. It supports modern browsers only.

*Freddy works better when added to the homescreen. On iOS this will prevent swipe gestures from triggering browser forward/back navigation.*

Freddy uses [Mithril.js](https://mithril.js.org/) and is written in Typescript.

## Development Install:

	npm install

### Recommended:

* **VS Code**
	- **tslint** extension
	- **stylelint** extension
	- **postcss-sugarss-language** extension
	- **editorconfig** extension

## Serve, watch:

	npm start

Then go to http://localhost:3000 in your browser.

## Build minified JS & CSS files:

	npm run build

Outputs to `public/`

## Build all-in-one index.html distribution file:

	npm run dist

Outputs to `dist/index.html`

## Clean:

	npm run clean
