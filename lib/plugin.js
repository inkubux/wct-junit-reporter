var _ = require('lodash');
var xml = require('pixl-xml');
var fs = require("fs");
var he = require('he');

function JunitReporter(emitter, pluginOptions) {
    this.tests = [];
    this.options = pluginOptions;

    function getBrowserDescription(browser) {
        var result = browser.browserName;

        if (_.size(browser.version) > 0) {
            result = result.concat(' ', browser.version);
        }

        if (_.size(browser.platform) > 0) {
            result = result.concat(' on ', browser.platform);
        }

        return he.encode(result).replace('.', ',');
    }

    function collectTestResult(browser, test) {
        if (_.size(test.test) === 3) {
            test.suite = he.encode(test.test[1]).concat('.', getBrowserDescription(browser));
            test.name = he.encode(test.test[2]);
        } else if (_.size(test.test) === 4) {
            //We usually have a nested context function call
            test.suite = he.encode(test.test[1]).concat('.', getBrowserDescription(browser));
            test.name = "[" + he.encode(test.test[2]) + "]  " + he.encode(test.test[3]);
        } else {
            test.suite = test.test[0];
            test.name = 'Unknown on '.concat(getBrowserDescription(browser));
            test.state = 'error';
            test.error = {message: 'Unknown test structure', stack:''};
        }
        this.tests.push(test);
    }

    function writeTestReport() {
        var results = {
            testsuites: {
                testsuite: _.map(_.sortBy(_.unique(_.pluck(this.tests, 'suite'))), function (suite) {
                    var tests = _.filter(this.tests, {suite: suite});
                    var testsuite = {
                        _Attribs: {name: suite, tests: tests.length, errors: 0, failures: _.size(_.filter(tests, {state: 'failing'})), skipped: _.size(_.filter(tests, {state: 'pending'}))},
                        testcase: _.map(tests, function (test) {
                            var testcase = {_Attribs: {name: test.name, time: test.duration}};
                            if (test.state === 'failing') {
                                testcase.failure = {_Attribs: {message: he.encode(test.error.message)}};
                            }
                            if (test.state === 'error') {

                                testcase.error = {_Attribs: {message: he.encode(test.error.message)}};
                                testcase['system-out'] = he.encode(test.error.stack);
                            }
                            if (test.state === 'pending') {
                                testcase.skipped = {};
                            }

                            return testcase;
                        })
                    };

                    return testsuite;
                })
            }
        };

        var outputPath = this.options['output-path'] || './';

        var filePath   = this.options['file-name'] || 'test-report.xml';

        console.log('Saving junit report to : [' + outputPath + filePath + ']');

        fs.writeFileSync(outputPath + filePath, xml.stringify(results).replace(/&amp;/g, '&'));
    }

    emitter.on('test-end', collectTestResult.bind(this));
    emitter.on('run-end', writeTestReport.bind(this));
};

module.exports = JunitReporter;
