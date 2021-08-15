import React, { Component } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import NewItemModal from './NewItemModal.js';
import SignupModal from './SignupModal.js';
import LoginModal from './LoginModal.js';
import Items from './Items.js';

const CHECK_LOGIN_URL =`${process.env.REACT_APP_BACK_END_BASE_URL}`+'/islogin';
const LOGOUT_URL =`${process.env.REACT_APP_BACK_END_BASE_URL}`+'/logout';

class Home extends Component  {
    constructor(props) {
      super(props);
  
      this.state = {
        loggedIn:false,
        errorMessage: null,
        downvoteMessage:null,
        email: null,
        itemAdded: 0
      };
  
      this.isLoggedIn = this.isLoggedIn.bind(this);
      this.logOut = this.logOut.bind(this);
      this.newItem = this.newItem.bind(this);
      this.downvoteMessage = this.downvoteMessage.bind(this);
      this.setErrorMessage = this.setErrorMessage.bind(this);
    }
  
    componentDidMount() {
      //console.log("HomeComponentDidMount");
      this.isLoggedIn();
      //console.log('END didMount');
    }
  
    componentDidUpdate(prevState) {
      // if (prevState.loggedIn!==this.state.loggedIn) {
      //   console.log('HomeComponentDidUpdate');
      // }
    }
  
    isLoggedIn() {
      const promise = axios.get(CHECK_LOGIN_URL, {withCredentials: true});
      promise
        .then((response) => {
          console.log('response from update', response.data);
          if (response.data.status===true) {
            this.setState({ 
              loggedIn:true,
              errorMessage:null,
              email:response.data.email
          });
          }
          else {
            this.setState({ 
              loggedIn:false,
              email: null,
            })
          }
        })
        .catch(() => {
          this.setState({ 
            errorMessage: 'login/signup failed or connection to backend failed'
          })
        });
    }
  
    logOut() {
      axios.get(LOGOUT_URL, {withCredentials: true,});
      this.isLoggedIn();
      this.setState({ 
        errorMessage: null
      })
    }
  
    newItem() {
      this.setState({ 
        itemAdded: this.state.itemAdded+1
      });
    }

    downvoteMessage() {
        this.setState({ 
            downvoteMessage: 'item downvoted'
        });
    }

    setErrorMessage(message) {
      this.setState({ 
          errorMessage: message
      });
  }
  
    render() {
      return (
        <div>
          <div className="row">
              <div className="col-md-6 col-md-offset-3">
                {!this.state.errorMessage ? <span></span>:<div className="alert alert-danger text-center">{this.state.errorMessage}<br></br><Button variant="secondary" onClick={ e => this.setState({errorMessage: null})}>Clear Message</Button></div>}
                {!this.state.downvoteMessage ? <span></span>:<div className="alert alert-success text-center">{this.state.downvoteMessage}<br></br><Button variant="secondary" onClick={ e => this.setState({downvoteMessage: null})}>Clear Message</Button></div>}
              </div>
            <div className="col-md-6 col-md-offset-3">
                {this.state.loggedIn ? <NewItemModal action={this.newItem} fail={this.setErrorMessage}/>: <SignupModal action={this.isLoggedIn} fail={this.setErrorMessage}/>}
                {/* <button className="btn btn-default pull-right"><i className="fa fa-sign-out"> </i> Logout</button>
                <button className="btn btn-default pull-right" data-toggle="modal" data-target="#login"><i className="fa fa-sign-in"> </i> Login</button> */}
                {this.state.loggedIn ? <button className="btn btn-default pull-right" onClick={this.logOut}><i className="fa fa-sign-out"> </i> Logout</button> : <LoginModal action={this.isLoggedIn} fail={this.setErrorMessage}/>}
            </div>
          </div>
          {/* <Items itemAdded={this.state.itemAdded} email={this.state.email} action={this.downvoteMessage} fail={this.downvoteFailure}/> */}
          <Items itemAdded={this.state.itemAdded} email={this.state.email} loggedIn={this.state.loggedIn} action={this.downvoteMessage} fail={this.setErrorMessage}/>
        </div>
      );
    }
  }
  
  
  export default Home;