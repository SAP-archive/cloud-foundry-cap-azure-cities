const fs = require('fs');
const express = require('express');
const formidableMiddleware = require('express-formidable');
const cfenv = require('cfenv').getAppEnv();
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

/******************************************************
  Data access functions for storage account
******************************************************/
const credentials = cfenv.isLocal ? require('./credentials') : cfenv.getService('azure-blob-storage').credentials;
const sharedKeyCredential = new StorageSharedKeyCredential(credentials.storageAccountName, credentials.accessKey);
const blobServiceClient = new BlobServiceClient(
  `https://${credentials.storageAccountName}.blob.core.windows.net`,
  sharedKeyCredential
);

const containerName = 'city-images';
const containerClient = blobServiceClient.getContainerClient(containerName);


async function getAllBlobs() {
  let blobs = [];
  let iter = await containerClient.listBlobsFlat();
  for await (const blob of iter) {
    blobs.push(blob);
  }
  return blobs;
}

async function storeBlob(fields, file) {
  const FOUR_MEGABYTES = 4 * 1024 * 1024;
  const uploadOptions = {
    bufferSize: FOUR_MEGABYTES,
    maxBuffers: 5,
  };
  const { itemID, currentUrl } = fields;
  const regex = new RegExp(itemID + '-(\\d*)');
  let itemName = itemID + '-1';
  if (regex.test(currentUrl)) {
    let count = +regex.exec(currentUrl)[1] + 1;
    itemName = `${itemID}-${count}`;
  }
  const stream = fs.createReadStream(file.path, {
    highWaterMark: FOUR_MEGABYTES,
  });

  const blockBlobClient = containerClient.getBlockBlobClient(itemName);
  await blockBlobClient.uploadStream(
    stream,
    uploadOptions.bufferSize,
    uploadOptions.maxBuffers
  );

  return blockBlobClient.url;
}

/******************************************************
  Define and start the server
 ******************************************************/

async function main() {
  const app = express();
  app.use(formidableMiddleware());

  await containerClient.create().catch(error => {
    if (error.details.Code !== "ContainerAlreadyExists") {
      throw error;
    }
  });

  await containerClient.setAccessPolicy('blob');

  app.get('/', async (req, res) => {
    const blobs = await getAllBlobs().catch(err => {
      res.status(500).send(err.message);
    });
    res.json(blobs);
  });

  app.post('/uploadhandler', async (req, res) => {
    if (!req.fields.itemID || !req.files.uploadedFile) {
      res.status(500).send("Missing parameter");
      return;
    }
    const url = await storeBlob(req.fields, req.files.uploadedFile).catch(err => {
      res.status(500).send(err.message);
    });
    res.send(url);
  });

  app.listen(cfenv.port, () => console.log(`Server listening on port ${cfenv.port}!`))
}

main();