Web Component Tester JUint Reporter
===================================

Generate junit reports from web-component-tester so the results can be parsed by Jenkins.

## Installation

```sh
npm install wct-junit-reporter --saveDev
```

## Basic Usage

Add the following configuration to web-component-tester's config file.

## Example

```js
module.exports = {
  plugins: {
    junit-reporter: {
     'output-path': './tmp/logs/',
     'file-name' : 'test-report.xml'
    }
  }
}
```

## Options

Below are the available configuration options:

- output-path: Folder where to save the report defaults to "./"
- file-name:   File name of the report defaults to "test-report.xml"
