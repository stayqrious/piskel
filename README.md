Code Studio Piskel
======

[![Travis Status](https://api.travis-ci.org/code-dot-org/piskel.png?branch=master)](https://travis-ci.org/code-dot-org/piskel)

This is a custom version of the excellent [Piskel Editor](https://github.com/juliandescottes/piskel) by [@juliandescottes](https://github.com/juliandescottes) and [@grosbouddha](https://github.com/grosbouddha), designed for embedded use with the Code.org Code Studio learning platform.  For more information on using or developing Piskel, please see [the main repository](https://github.com/juliandescottes/piskel).

This project is published on npm as [@code-dot-org/piskel](https://www.npmjs.com/package/@code-dot-org/piskel).

## Using this package

Install the package from npm:

```
npm install @code-dot-org/piskel
```

This will install the release build of Piskel to `node_modules/@code-dot-org/piskel`.  The application root is at `node_modules/@code-dot-org/piskel/dest/prod`.  You can run the static version of Piskel by opening `index.html` in that folder.

A `piskel-root` utilty is also installed at `node_modules/.bin/piskel-root` that prints the absolute path to the application root.  It's recommended that you depend on this utility in any build scripts to be resilient against future changes to the internal layout of the Piskel package.

## Local Development Setup

Note: To run local integration tests you should install CasperJS 1.0.2 (not included as a dependency in this repo) and make sure it has access to PhantomJS 1.9.2 (downloaded to node_modules/.bin on `npm install` but not necessarily in your PATH).

## Publishing a new version

This repository depends on a Node version >=7. Please use Node >=7 when building and updating
new releases of this Piskel to NPM.

To publish a new version to npm switch to the master branch, use `npm login` to sign in as an account with access to the `@code-dot-org` scope, then `npm version [major|minor|patch]` for the appropriate version bump.  This will do the following:

* Run linting and tests to verify your local repo.
* Rebuild the release package.
* Bump the version, adding a corresponding commit and version tag.
* Push the commit and tag to github.
* Publish the new release package to npm.

## i18n
i18n which stands for internalization is being applied to Piskel to allows for all content in Piskel to be translated

Currently there is a directory called i18n which contains the locale directory. In this directory, you
will find all the string translations in JSON format. Each file is named as follows: languageCode_countryCode

For example: en_us.json where en is English and us is United States

The strings that we will be used depend on the window.locale. window.locale is the 4 letter locale
code defined by users of the Piskel library so they can optionally load non-English strings
into the Piskel UI. For example "en_us" or "es_es"
window.locales will contains all strings available, then we will use window.locale to select the language
we want strings to be in. All of this is happening here: var i18n = window.locales[window.locale];

To see how each key becomes a function look at the tasks/build-i18n.js file where we use the MessageFormat API

## License

Code Studio Piskel is Copyright 2016 Code.org

Piskel is Copyright 2016 Julian Descottes

Both are licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
