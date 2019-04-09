import Geocode from "react-geocode";

// set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
Geocode.setApiKey("AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRrs");

// Enable or disable logs. Its optional.
Geocode.enableDebug();

// Get latidude & longitude from address.
Geocode.fromAddress(address).then(
    response => {
      const obj = {lat, lng};  
      obj = response.results[0].geometry.location;
      console.log(obj);
      return obj;
    },
    error => {
      console.error(error);
      return error;
    }
  );