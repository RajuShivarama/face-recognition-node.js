import './App.css';
import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import 'tachyons';


const app = new Clarifai.App({
  apiKey: '79b6f0fa23034cff8c1fe4e749b7577d'
 });


const particleOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}


class App extends Component {
  constructor() {
    // super method -> component constructor
    super();
    // initialization of the react life cycle
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        entries: data.entries,
        joined: data.joined
    }})
  }

  // componentDidMount() {
  //   fetch('http://localhost:3001/')
  //     .then(response => response.json())
  //     .then(console.log);
  // }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models.predict(
                        {
                          id: "a403429f2ddf4b49b307e318f00e528b",
                          version: "34ce21a40cc24b6b96ffee54aabff139",
                        },
                        this.state.input
                      )
                      // console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
    .then((response) => {
      if(response){
        fetch('https://smartfacerecognize.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          //   we are converting the json object into the javascript object to send it to the server
          body: JSON.stringify({
          id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count }))
        })
        }
      this.displayFaceBox(this.calculateFaceLocation(response))

    })
    .catch((err) => {
      console.log("Clarifai Error:", err);
    });
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    }
    else if(route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route})
  }

  render(){
    // we can just replace all state variables with below 
    const { isSignedIn, imageUrl, route, box, user } = this.state
    return (
      <div className="App">
        <Particles className='particles'
          params={particleOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' ?
            <div>
              <Logo />
              <Rank name={user.name} entries={user.entries}/>
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              { imageUrl ? <FaceRecognition imageUrl={imageUrl} box={box}/> : null }
            </div>
        :
          (
            route === 'signin' ? 
              <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
          
        }
      </div>
    );
  }
    
}

export default App;
