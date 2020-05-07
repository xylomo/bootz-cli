import React from 'react';
import { Switch, Route, Redirect } from "react-router-dom"
import HomeComponent from './pages/home';

const allRoutes: any[] = [
  {
    path: '/home',
    component: HomeComponent,
    exact: true,
  },
  {
    path: '/',
    component: HomeComponent,
    exact: true,
  },
  {
    path: '/redirect',
    from: '/redirect',
    redirect: true,
    to: '/home',
  }
];

export default allRoutes;

export const Routes: React.FC = () => (
  <Switch>
    {allRoutes.map((route, index) => {
      if (route.redirect) {
        return (<Redirect {...route} key={index} /> )
      } else {
        return (<Route key={index} {...route} />);
      }
    })}
  </Switch>
)