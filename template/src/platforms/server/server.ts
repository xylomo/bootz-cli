import express from 'express';
import { render } from './render';

const isDev = process.env.NODE_ENV === 'development';

export const app = express();

// Serve static
if (!isDev) {
  app.use('/static', express.static('./dist/static'));
}

app.get('*', async (req, res) => {

  try {
    await render({ req, res });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sorry, not available at this time');
  }
  
});
