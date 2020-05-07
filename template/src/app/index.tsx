
import React from 'react';
import allRoutes from './routes';
import { Switch, Route } from 'react-router-dom';
import ErrorBoundary from './components/hocs/ErrorBoundary';

import './assets/styles/reset.scss';

const NotFound = (props) => <div>Not found</div>;

export const App = () => (
  <ErrorBoundary>
    <Switch>
      {allRoutes.map(({ path, exact, component: Component, ...rest }) => (
        <Route key={path} path={path} exact={exact} render={(props) => (
          <Component {...props} {...rest} />
        )} />
      ))}
      <Route render={(props) => <NotFound {...props} /> } />
    </Switch>
  </ErrorBoundary>
);

export default App;