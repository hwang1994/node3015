import React, { Component } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

const BASE_URL = `${process.env.REACT_APP_BACK_END_BASE_URL}`;
const PHOTO_STORAGE ='/pictures/';

class ProductView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedID: window.location.search.substr(4),
      selectedProduct: []
    };

  }

  componentDidMount() {
    //console.log('ProductView Mounted')
    //console.log(this.state.selectedID)
    const promise = axios.get(BASE_URL+'/getitem?id='+this.state.selectedID, {withCredentials: true,});
    promise
    .then((response) => {
      console.log('product view response', response.data);
      if (response.data != 'Product does not exist!' || response.data != 'Error finding Product') {
        this.setState({ 
          selectedProduct: response.data
        })
      }
      //console.log('selectedProduct', this.state.selectedProduct);
    })
    .catch(() => {
    });
    //console.log('END ProductViewdidMount');
  }

  componentDidUpdate(prevState) {
    //console.log('ProductViewComponentDidUpdate');
  }

  componentWillUnmount() {
    
  }

  render() {
    if (this.state.selectedProduct.id) {
      return (
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
          <br></br>
            <Card key={this.state.selectedProduct.id}>
              <Card.Header><Link to='/'><Button>Back</Button></Link></Card.Header>
              <Card.Img variant="top" src={BASE_URL+PHOTO_STORAGE+this.state.selectedProduct.picture}  />
              <Card.Body>
                <Card.Title>{this.state.selectedProduct.title}</Card.Title>
                <Card.Text>{this.state.selectedProduct.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted"><span><a href={`mailto:${this.state.selectedProduct.email}`} data-toggle="tooltip" title="Email seller"><i className="fa fa-envelope"></i>{this.state.selectedProduct.name}</a></span> <span className="pull-right">${(Math.round(this.state.selectedProduct.price * 100) / 100).toFixed(2)}</span></Card.Footer>
            </Card>
            <br></br>
          </div>
        </div>
      );
    }
    else {
      return (
        <div>No Item Found!</div>
      );
    }
  }

}
export default ProductView;