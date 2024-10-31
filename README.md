# keyman-vancouver

A prototype future Keyman Developer.

## What's inside?

Based on a generated template for [Eclipse Theia](https://theia-ide.org), this application consists of a set of Theia and VSCode plugins.

### Extensions

- [`extensions/keyman-kpj`](./extensions/keyman-kpj/) is a VSCode plugin which provides the Keyman Project and Keyman LDML editing capabilities
- [`keyman-vancouver/`](./extensions/keyman-vancouver/) is a Theia plugin which provides the basic personality

### Scaffolding

- `browser-app` and `electron-app` are the web and desktop apps, respectively. The are largely auto generated, but have resources and package.json contents to be kept in sync.
- `plugins` is a directory of symlinks that is used when the app starts up. In the future we could just use `extensions` directly, but this is reserved in case we choose to use some downloaded plugins that aren't also hosted here.

### Misc

- yes, lerna and even yarn are used in some places. A to-do item is to remove them.

## Building and Running

### Prerequisites

- Node 20 (see [.node-version](./.node-version))
- python and tools for building native modules - see this article on the Theia [prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites).


### Running the browser version

    npm i
    npm run build:browser
    ( cd extensions/keyman-kpj ; npm i ; npm run build )
    npm run start:browser

Open http://localhost:3000 in the browser.

*or:* launch `Start Browser Backend` configuration from VS code.

### Running the Electron version

    npm i
    npm run build:electron
    npm run start:electron

*or:* launch `Start Electron Backend` configuration from VS code.

### Packaging Electron

    npm run package:electron

## Dev

### Developing with the browser

Start watching (continuous rebuild of) all packages, including `browser-app`, of your application with

    npm run watch:browser

Now run the as described above

### Developing with the Electron example

Start watching all packages, including `electron-app`, of your application with

    npm run watch:electron

Now run the as described above

## License

Copyright (c) SIL Global.

Keyman is an open source project distributed under the [MIT license](LICENSE.md).
