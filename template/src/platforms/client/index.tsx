import React from 'react';
import { Renderer, hydrate, render } from 'react-dom';
import { loadableReady } from '@loadable/component';
import { App } from '../../app';
import { BrowserRouter } from 'react-router-dom';

const bootstrap = (renderer: Renderer) => {
  const root = document.getElementById('__main__');
  if (!root) {
    console.error('Root element was not found. Ensure that it exists.');
    document.body.innerHTML = '<div>Sorry, but something went wrong while trying to load this page. Please try again later.</div>';
    return;
  }
  console.log('Rendering app now');
  const app = (
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  )
  renderer(app, root);
}

if (module.hot && typeof module.hot !== 'undefined') {
  bootstrap(render);
  module.hot.accept(console.error);
} else {
  loadableReady(() => bootstrap(hydrate) );
}
