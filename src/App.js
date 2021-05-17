import './App.css';
import React,{Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import ParticlesBg from 'particles-bg';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';

const app= new Clarifai.App({
apiKey : '963b88011ca64201a353a389aa7a370e'
});



class App extends Component {

  constructor(){
    super();
    this.state = {
      input : '',
      imageUrl : '',
      box : {},
      route : 'signin',
      isSignedIn : false,
      user : {
        id : '',
        name : '',
        email : '',
        entries : 0,
        joined : ''
      }

    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id : data.id,
      name : data.name,
      email : data.email,
      entries : data.entries,
      joined : data.joined
    }})
  }

// componentDidMount(){
//   fetch('http://localhost:3003/')
//   .then(response=>response.json())
//   .then(console.log)
// }


 onRouteChange=(route)=>{
  if(route === 'signout') {
    this.setState({isSignedIn:false})
  } else if (route === 'home') {
    this.setState({isSignedIn : true})
  }
  this.setState({route:route});
 }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0]
    .data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol : clarifaiFace.left_col*width,
      topRow : clarifaiFace.top_row*height,
      rightCol : width-(clarifaiFace.right_col*width),
      bottomRow : height-(clarifaiFace.bottom_row*height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box:box});
  }

  onInputChange=(event)=>{
    this.setState({input:event.target.value});
  }

  onButtonSubmit=()=>{
    this.setState({imageUrl:this.state.input});
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
    .then(response => {
      if(response) {
        fetch('https://peaceful-refuge-89924.herokuapp.com/image',{
          method : 'put',
          header : {'Content-Type':'application/json'},
          body:JSON.stringify({
            id:this.state.user.id
          })
        })
        .then(response=>response.json())
        .then(count=>{
          this.setState(Object.assign(this.state.user,{entries:count}))
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err=>console.log(err));
}






  render () { 
    const { isSignedIn,imageUrl, route,box} = this.state;
  return (
    <div className="App">

     <ParticlesBg  num={70} 
     type="circle" bg={true}/>



    <div> 
     <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>


     { 
      route === 'home'
     ? <div>  
     <Logo/>
     <Rank
     name={this.state.user.name}
     entries={this.state.user.entries}
     />
     <ImageLinkForm
      onInputChange={this.onInputChange}
      onButtonSubmit={this.onButtonSubmit}
      />
     <FaceRecognition box={box} imageUrl={imageUrl}/>
      </div>
      : (
          route === 'signin'
          ?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
     }


     </div>


    </div>

  );
 }
}

export default App;