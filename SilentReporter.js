const jestUtils = require('jest-util');
const helpers = require('./helpers');
const StdIo = require('./StdIo');


function logFailedTestResultDetail(trd) {
  const trdFlush = {
    ancestorTitles,
    duration,
    failureMessages,
    fullName,
    location,
    title,
    status,
  } = trd;

  return trd;
}

function logFailedTestResult(tr) {
  const trHeader = {
    failureMessage,
    numFailedTestSuites,
    numFailedTests,
    numRuntimeErrorTestSuites,
    startTime,
  } = tr;

  trHeader.testResults = [];
  for (let i = 0; i < tr.testResults.length; i++) {
    const trd = tr.testResults[i];
    if (trd) { //  && trd.status !== 'passed') {
      const reTrd = logFailedTestResultDetail(trd);
      trHeader.testResults.push(reTrd);
    }
  }

  if (trHeader.testResults.length === 0) {
    trHeader.testResults = null;
  }

  return trHeader;
}

class SilentReporter {
  constructor(globalConfig, options = {}) {
    this._globalConfig = globalConfig;
    this.stdio = new StdIo();
    this.useDots = !!process.env.JEST_SILENT_REPORTER_DOTS || !!options.useDots;
  }

  onRunStart() {
    if (jestUtils.isInteractive) {
      jestUtils.clearLine(process.stderr);
    }
  }

  onRunComplete() {
    if (this.useDots) {
      this.stdio.log('\n');
    }
    this.stdio.close();
  }

  // I remove all of the crap [22m strings that Jest returns
  // and return a nicely formatted JSON response for each test
  // one on each line for Splunk.

  onTestResult(test, testResult) {
    if (this.useDots) {
      this.stdio.logInline('.');
    }

    if (!testResult.skipped) {
      if (testResult.failureMessage) {
        const jsonFailed = logFailedTestResult(testResult);
        const failedStr = JSON.stringify(jsonFailed);
        const niceStr = failedStr.replace(/\[\d+m/g, '');
        this.stdio.log('\n' + niceStr);
      }
      const didUpdate = this._globalConfig.updateSnapshot === 'all';
      const snapshotStatuses = helpers.getSnapshotStatus(
        testResult.snapshot,
        didUpdate
      );
      snapshotStatuses.forEach(this.stdio.log);
    }
  }
}

module.exports = SilentReporter;
