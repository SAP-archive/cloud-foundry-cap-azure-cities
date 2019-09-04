const fs = require('fs');
const express = require('express');
const formidableMiddleware = require('express-formidable');
const cfenv = require('cfenv').getAppEnv();
const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential,
  uploadStreamToBlockBlob
} = require("@azure/storage-blob");

/******************************************************
  Data access functions for storage account
******************************************************/

const credentials = cfenv.isLocal ? require('./credentials') : cfenv.getService('azure-blob-storage').credentials;
const sharedKeyCredential = new SharedKeyCredential(credentials.storageAccountName, credentials.accessKey);
const pipeline = StorageURL.newPipeline(sharedKeyCredential);
const serviceURL = new ServiceURL(`https://${credentials.storageAccountName}.blob.core.windows.net`, pipeline);
const containerURL = ContainerURL.fromServiceURL(serviceURL, 'city-images');

async function getAllBlobs(containerURL) {
  let blobs = [], marker = undefined;
  do {
    const listBlobsResponse = await containerURL.listBlobFlatSegment(
      Aborter.none,
      marker
    );

    marker = listBlobsResponse.nextMarker;
    blobs = [...blobs, ...listBlobsResponse.segment.blobItems];
  } while (marker);
  return blobs;
}

async function storeBlob(containerURL, fields, file) {
  const FOUR_MEGABYTES = 4 * 1024 * 1024;
  const {itemID, currentUrl} = fields;
  const regex =new RegExp(itemID+'-(\\d*)');
  let itemName = itemID + '-1';
  if(regex.test(currentUrl)){
    let count = +regex.exec(currentUrl)[1]+1;
    itemName = `${itemID}-${count}`;
  }
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, itemName);

  const stream = fs.createReadStream(file.path, {
    highWaterMark: FOUR_MEGABYTES,
  });

  const uploadOptions = {
    bufferSize: FOUR_MEGABYTES,
    maxBuffers: 5,
  };

  await uploadStreamToBlockBlob(
    Aborter.none,
    stream,
    blockBlobURL,
    uploadOptions.bufferSize,
    uploadOptions.maxBuffers);
  return blockBlobURL.url;
}

/******************************************************
  Define and start the server
 ******************************************************/

async function main() {
  const app = express();
  app.use(formidableMiddleware());

  await containerURL.create(Aborter.none).catch(error => {
    if (error.body.code !== "ContainerAlreadyExists") {
      throw error;
    }
  });

  await containerURL.setAccessPolicy(Aborter.none, 'blob');

  app.get('/', async (req, res) => {
    const blobs = await getAllBlobs(containerURL).catch(err => {
      res.status(500).send(err.message);
    });
    res.json(blobs);
  });

  app.post('/uploadhandler', async (req, res) => {
    if (!req.fields.itemID || !req.files.uploadedFile) {
      res.status(500).send("Missing parameter");
      return;
    }
    const url = await storeBlob(containerURL, req.fields, req.files.uploadedFile).catch(err => {
      res.status(500).send(err.message);
    });
    res.send(url);
  });

  app.listen(cfenv.port, () => console.log(`Server listening on port ${cfenv.port}!`))
}

main();