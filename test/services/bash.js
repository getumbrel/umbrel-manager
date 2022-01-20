/* globals requester */

const assert = require('assert');
const bash = require("../../services/bash");

describe('bash', () => {
  it('should execute a command', done => {
    const echoString = "Umbrel";

    bash.exec('echo', [echoString])
    .then(response => {
      assert.equal(response.err, "");
      assert.equal(response.out, echoString + "\n")

      done();
    });    
  });

  it('should execute a command with ENV set', done => {
    bash.exec('env', [], {
      env: {
        UMBREL_TEST_KEY: "UMBREL_TEST_VALUE"
      }
    })
    .then(response => {
      assert.equal(response.err, "");
      expect(response.out).to.match(/(UMBREL_TEST_KEY=UMBREL_TEST_VALUE)/)

      done();
    });    
  });

  it('should execute a command with ENV and make sure it is not previously polluted', done => {
    bash.exec('env', [], {
      env: {
        UMBREL_TEST_KEY_2: "UMBREL_TEST_VALUE_2"
      }
    })
    .then(response => {
      assert.equal(response.err, "");
      expect(response.out).to.not.match(/(UMBREL_TEST_KEY=UMBREL_TEST_VALUE)/)
      expect(response.out).to.match(/(UMBREL_TEST_KEY_2=UMBREL_TEST_VALUE_2)/)

      done();
    });    
  });
});
