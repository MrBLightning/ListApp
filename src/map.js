import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import '../src/index';
import geocoder from 'google-geocoder'; 

const AnyReactComponent = ({ text }) => <div className="markerImg">{text}</div>;
 
class SimpleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PositionObj: {latitude: 32.087312, longitude: 34.804063},
      Address: '',
      zoom: 14
    };  
  }

  // static defaultProps = {
  //   DefCenter: {
  //     lat: 32.087312,
  //     lng: 34.804063
  //   },
  //   zoom: 14
  // };
  
  render() {
    //Use the geocoder with the Google API Key to get the position of address prop passed to the map
    const geo = geocoder({
      key: "AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRrs", //Google API Key
    });

    // Get latidude & longitude from address.
    if(this.props.Address !== this.state.Address){
      geo.find(this.props.Address, (err, res) => {
        let pos = {latitude: NaN, longitude: NaN};
        if (err) {
          console.error(err);
          //return pos;
          this.setState({
            PositionObj: this.props.DefCenter,
            Address: this.props.Address
          });   
        } else {
          if(res[0] !== undefined){
            let latitude = res[0].location.lat;
            let longitude = res[0].location.lng;
            pos = {lat: latitude, lng: longitude};
            //console.log("inside", pos);
            //return pos;
            this.setState({
              PositionObj: pos,
              Address: this.props.Address
            });
          }
        }
      });
    }
    return (
      // Important! Always set the container height explicitly
      <div className="Map">
        <GoogleMapReact
          bootstrapURLKeys = {{ key: 'AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRr' }}
          defaultCenter = {this.state.PositionObj}
          defaultZoom = {this.state.zoom}
        >

        {/*<AnyReactComponent lat={32.087312} lng={34.804063} />*/}
        {console.log("darw this position: ", this.state.PositionObj)}
        <AnyReactComponent lat={this.state.PositionObj.lat} lng={this.state.PositionObj.lng} />

        </GoogleMapReact>
      </div>
    );
  }
}
 
export default SimpleMap;