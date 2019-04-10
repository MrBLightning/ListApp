import React, { Component } from 'react';
import geocoder from 'google-geocoder'; 
class Geocoder extends Component {

  render() {
    //Use the geocoder with the Google API Key to get the position of address prop passed to the map
    const Geo = geocoder({
      key: "AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRrs", //Google API Key
    });

    // Get latidude & longitude from address.
    let position = Geo.find(this.props.Address, (err, res) => {
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
    
    return (
      position
    );
  }
}  
 
export default Geocoder;