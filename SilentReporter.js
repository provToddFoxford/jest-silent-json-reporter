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
    if (trd && trd.status !== 'passed') {
      const reTrd = logFailedTestResultDetail(trd);
      trHeader.testResults.push(reTrd);
    }
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

  onTestResult(test, testResult) {
    if (this.useDots) {
      this.stdio.logInline('.');
    }

    if (!testResult.skipped) {
      if (testResult.failureMessage) {
        // this.stdio.log('\n' + testResult.failureMessage);

        const jsonFailed = logFailedTestResult(testResult);
        this.stdio.log('\n', + JSON.toString(jsonFailed));ß
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
