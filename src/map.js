import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import '../src/index';
import geocoder from 'google-geocoder';
 
const AnyReactComponent = ({ text }) => <div className="markerImg">{text}</div>;
 
class SimpleMap extends Component {
  static defaultProps = {
    DefCenter: {
      lat: 32.087312,
      lng: 34.804063
    },
    zoom: 14
  };

  render() {
    //Use the geocoder with the Google API Key to get the position of address prop passed to the map
    const geo = geocoder({
      key: "AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRrs", //Google API Key
    });
    //the geo.find function from the geocoder object converts the address to a set of latitude and longitude (Position) 
    console.log("got address: ", this.props.Address);
    let PositionObj =  geo.find(this.props.Address, (err, res) => {
      let pos = {latitude: NaN, longitude: NaN};
      if (err) {
        console.error(err);
        return pos;   
      } else {
        if(res[0] !== undefined){
          let latitude = res[0].location.lat;
          let longitude = res[0].location.lng;
          pos = {lat: latitude, lng: longitude};
          console.log("inside", pos);
          return pos;
        }
      }
    }); 
    if(PositionObj !== undefined && !isNaN(PositionObj.lat) && !isNaN(PositionObj.lng)){
      console.log("worked", PositionObj);
    } else{
      console.log("didn't work");
      PositionObj = this.props.DefCenter;
    } 
    // let CenterObj = {lat: this.props.lat, lng: this.props.lng};
    // if (CenterObj.lat === NaN || CenterObj.lng === NaN){
    //   CenterObj = this.props.DefCenter;
    // }
    return (
      // Important! Always set the container height explicitly
      <div className="Map">
        <GoogleMapReact
          bootstrapURLKeys = {{ key: 'AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRr' }}
          defaultCenter = {PositionObj}
          defaultZoom = {this.props.zoom}
        >

        {/*<AnyReactComponent lat={32.087312} lng={34.804063} />*/}
        <AnyReactComponent lat={PositionObj.lat} lng={PositionObj.lng} />

        </GoogleMapReact>
      </div>
    );
  }
}
 
export default SimpleMap;