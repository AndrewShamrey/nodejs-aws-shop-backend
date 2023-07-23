const express = require('express');
const cors = require("cors");
require('dotenv').config();
const StatusCodes = require('http-status-codes').default;
const axios = require('axios').default;
const NodeCache = require('node-cache');

const isGetProductsListRequest = (method, originalUrl) => method === 'GET' && originalUrl.endsWith('/products');

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_TTL = 2 * 60; // seconds
const modifiers = {};
const cache = new NodeCache();

app.use(cors());
app.use(express.json());

app.all('/*', (req, res) => {
  const { method, originalUrl, body, headers: initHeaders = {} } = req;
  const query = originalUrl.split('/')[1];
  const recipient = query.split('?')[0];
  console.log('\nIncoming event processing started', { method, recipient, originalUrl, body, initHeaders });

  const recipientURL = process.env[recipient];
  console.log('Recipient URL was mapped from environment variables', { recipientURL });

  if (recipientURL) {
    const isRequestCacheable = [isGetProductsListRequest(method, originalUrl)].some(Boolean);
    if (isRequestCacheable && cache.has(recipient)) {
      const { status, data } = cache.get(recipient);
      const ttl = cache.getTtl(recipient);
      console.log(`Data was received from cache. Cache will be expired at ${new Date(ttl)}`, data);

      res.status(status).json(data);
      return;
    };

    const lowerHeaders = Object.fromEntries(
      Object.entries(initHeaders)
        .map(([key, value]) => [key.toLowerCase(), value])
    );
    const auth = lowerHeaders.authorization;
    const headers = {};
    if (auth) headers.authorization = auth;

    const axiosConfig = {
      method,
      headers,
      url: `${recipientURL}${originalUrl}`,
      ...(Object.keys(body || {}).length > 0 && { data: body }),
    };
    console.log('Axios config was prepared', axiosConfig);
    
    axios(axiosConfig)
      .then((response) => {
        const { status, data } = response;
        console.log('Response from recipient was successfully received', data);

        const modifier = modifiers[recipient];
        const preparedData = modifier ? modifier(data) : data;

        if (isRequestCacheable) {
          cache.set(recipient, { status, data }, CACHE_TTL);
          console.log(`Data was cached and will be expired at ${new Date(Date.now() + (CACHE_TTL * 1000))}`);
        }

        res.status(status).json(preparedData);
      })
      .catch((error) => {
        console.log('Some error: ', JSON.stringify(error));
        if (error.response) {
          const { status, data } = error.response;
          res.status(status).json(data);
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
      });
  } else {
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Cannot process request' });
  }
});

app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});
