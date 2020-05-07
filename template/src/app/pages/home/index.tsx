import React from 'react';
import loadable from '@loadable/component';

const HomeComponent = loadable(() => import ('./home'), {
  fallback: <div>Loading home page!</div>,
});

export default (props) => (
  <HomeComponent {...props} />
);
