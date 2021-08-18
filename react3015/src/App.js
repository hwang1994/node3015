import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import Home from './Home';
import ProductView from './ProductView';
import axios from 'axios';
require('dotenv').config();

const CSRF_TOKEN_URL =`${process.env.REACT_APP_BACK_END_BASE_URL}`+'/csrf';

class App extends Component {
  componentDidMount() {
    axios.get(CSRF_TOKEN_URL, {withCredentials: true})
    .then((response) => {
      //console.log(response.data);
      axios.defaults.headers.post['X-CSRF-TOKEN'] = response.data;
      axios.defaults.headers.delete['X-CSRF-TOKEN'] = response.data;
    })
  }
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Home} exact/>
          <Route path="/product" component={ProductView} exact/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
