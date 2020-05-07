import React from 'react';
import path from 'path';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { minify } from 'html-minifier';
import { App } from '../../app';

const statsFile = path.resolve(process.cwd(), 'dist/loadable-stats.json');

export async function render({ req, res }): Promise<void> {

  const extractor = new ChunkExtractor({
    statsFile,
  });

  const staticContext: any = {};

  const app = (
    <ChunkExtractorManager extractor={extractor}>
      <StaticRouter location={req.path} context={staticContext}>
        <App/>
      </StaticRouter>
    </ChunkExtractorManager>
  );

  const html = renderToString(app);

  const generated = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${extractor.getStyleTags()}
      </head>
      <body>
        <div id="__main__">${html}</div>
        ${extractor.getScriptTags()}
      </body>
    </html>`;
  let parsedHtml = generated;
  if (process.env.NODE_ENV === 'production') {
    parsedHtml = minify(parsedHtml, {
      collapseWhitespace: true,
      removeComments: true,
    });
  }
  res.status(200).send(parsedHtml);

}