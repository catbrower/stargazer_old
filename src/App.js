import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from './components/home';
import Header from './components/header';
import StarMap from './components/map';
import Page404 from './components/errors/Page404';

function App() {
  return (
      <div>
      <Header />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/map' component={StarMap} />
        <Route path="*" component={Page404} />
      </Switch>
      </div>
  );
}

export default App;
