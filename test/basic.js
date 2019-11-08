const cds = require('@sap/cds/bin/serve')
const assert = require('assert');
const cluster = require('cluster');
const axios = require('axios');

var base_url = "http://localhost:4004/"

let ms = 2000;

Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

describe("Checking the server process", function () {
  this.timeout(12000)

  before(() => {
    return cds(undefined, { 'in-memory': true }); //TODO find a way to supress output
  });

  it("returns status code 200", function () {
    return axios.get(base_url)
      .then(function (response) {
        assert.equal(200, response.status);
      });
  });

  it("returns seven cities", function () {
    return axios.get(`${base_url}/catalog/Cities`)
      .then(function (response) {
        assert.equal(6, response.data.value.length);
      });
  });

  after(function () {
    process.exit(); //exit manually to kill child process
  });


});
