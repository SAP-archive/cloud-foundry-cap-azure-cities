const assert = require('assert');
const axios = require('axios');
const cds = require('@sap/cds');
const express = require('express');

const { PORT = 4004 } = process.env;
const base_url = "http://localhost:4004/catalog"

describe("Checking the server process", function () {
  this.timeout(12000);

  before(async () => {
    const app = express();
    app.listen(PORT);
    await cds.connect(!cds.db && cds.env.requires.db || false);
    await cds.serve(undefined, { 'in-memory': true }).in(app);
  });

  it("returns status code 200", function () {
    return axios.get(base_url)
      .then(function (response) {
        assert.equal(200, response.status);
      });
  });

  it("returns seven cities", function () {
    return axios.get(`${base_url}/Cities`)
      .then(function (response) {
        assert.equal(6, response.data.value.length);
      });
  });

  after(function () {
    process.exit(); //exit manually to kill child process
  });

});
