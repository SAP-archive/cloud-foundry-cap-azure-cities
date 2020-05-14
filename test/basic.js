const assert = require('assert');
const axios = require('axios');
const cds = require('@sap/cds');
const express = require('express');

const { PORT = 4004 } = process.env;
const baseUrl = 'http://localhost:4004/catalog';
var server;

describe('Checking the server process', function () {
  this.timeout(12000);

  before(async () => {
    const app = express();
    server = app.listen(PORT);
    await cds.connect(!cds.db && cds.env.requires.db || false);
    await cds.serve(undefined, { 'in-memory': true }).in(app);
  });

  it('returns status code 200', function () {
    return axios.get(baseUrl)
      .then(function (response) {
        assert.equal(200, response.status);
      });
  });

  it('returns six cities', function () {
    return axios.get(`${baseUrl}/Cities`)
      .then(function (response) {
        assert.equal(6, response.data.value.length);
      });
  });

  after(function () {
    cds.disconnect();
    server.close()
  });
});