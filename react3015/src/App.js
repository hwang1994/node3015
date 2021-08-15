import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import Home from './Home';
import ProductView from './ProductView';
require('dotenv').config()

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" component={Home} exact/>
        <Route path="/product" component={ProductView} exact/>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
