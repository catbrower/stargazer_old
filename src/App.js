import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from './components/home';
import Header from './components/header';
import StarMap from './components/map';

import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/map' component={StarMap} />
      </Switch>
    </div>
  );
}

export default App;
