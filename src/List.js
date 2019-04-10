import React, { Component } from 'react';
import { GoogleMap, withGoogleMap } from 'react-google-maps';
import geocoder from 'google-geocoder';
import ReactGoogleMapLoader from "react-google-maps-loader";
import map from '../src/map';

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Countries: [],
            Cities: [],
            Companies: [],
            CountryIndex: 0,
            CityIndex: 0,
            //these props are for the map
            googleMapUrl: `https://maps.googleapis.com/maps/api/js?key=AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRr`,
            APIKey: 'AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRr',
            zoom: 11,
            center: { lat: 29.969516, lng: -90.103866 },
            markers: [],
            markersLoaded: false
        };
        this.sort_array_by = this.sort_array_by.bind(this);
        this.AlphabeticalSort = this.sort_array_by.bind(this);
        this.parseDataCountries = this.parseDataCountries.bind(this);
        this.parseDataCities = this.parseDataCities.bind(this);
        this.parseDataCompanies = this.parseDataCompanies.bind(this);
        this.CountryhandleCheck = this.CountryhandleCheck.bind(this);
        this.CityhandleCheck = this.CityhandleCheck.bind(this);
        this.CompanyhandleCheck = this.CompanyhandleCheck.bind(this);  
        this.FindLatLong = this.FindLatLong.bind(this);      
    }

  //First thing, get the Clients.json file and load the data from it  
  componentDidMount() {
    fetch('/clients.json')
      .then(res => res.json())
      .then(this.onLoad);
  }

  //sort_array_by is a general sorting function for arrays of objects
  sort_array_by (field, reverse, pr){
    reverse = (reverse) ? -1 : 1;
    return function(a,b){
      a = a[field];
      b = b[field];
      if (typeof(pr) != 'undefined'){
        a = pr(a);
        b = pr(b);
      }
      if (a<b) return reverse * -1;
      if (a>b) return reverse * 1;
      return 0;
    }
  }  

  //AlphabeticalSort is a function to sort an array of objects by some specific key alphabetically
  AlphabeticalSort(property) {
    let sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder === -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
  }

  FindLatLong(address, callback){
    // var geocoder = new google.maps.Geocoder();

    // geocoder.geocode({ 'address': address }, function (results, status) {
    //     if (status == google.maps.GeocoderStatus.OK) {
    //         var lat = results[0].geometry.location.lat();
    //         var lng = results[0].geometry.location.lng();
    //         callback({ Status: "OK", Latitude: lat, Longitude: lng });
    //     }
    // });

  }

  parseDataCountries(data) {
    let lng = data.length;
    let CountryList = [];
    for (var i = 0; i < lng; i++) {
        let obj = CountryList.find(x => x.Country === data[i].Country);
        let index = CountryList.indexOf(obj);
        if(index >= 0){
            if(CountryList[index].Cities.indexOf(data[i].City) === -1){
                CountryList[index].Cities.push(data[i].City);
                CountryList[index].NumOfCities = CountryList[index].Cities.length; 
            }
        }
        else{
            let CountryListObj = {Country: data[i].Country, CountrySelected: false, NumOfCities: 1, Cities:[data[i].City], key: Math.random() + i};
            CountryList.push(CountryListObj);
        }
    }
    CountryList.sort(this.sort_array_by('NumOfCities', true, function(a){
        //Since I'm sorting by NumOfCities which is an integer I need to return a blank integer for the swap needed inside the sort
        return parseInt(a);
     }));
    //make sure after the sort that the first element of the array is picked
    CountryList[0].CountrySelected =  true;
    return CountryList;
  }

  parseDataCities(data) {
    let lng = data.length;
    let CityList = [];
    for (var i = 0; i < lng; i++) {
        let obj = CityList.find(x => x.City === data[i].City);
        let index = CityList.indexOf(obj);
        if(index >= 0){
            if(CityList[index].Companies.indexOf(data[i].CompanyName) === -1){
                CityList[index].Companies.push(data[i].CompanyName);
                CityList[index].NumOfCompanies = CityList[index].Companies.length; 
            }
        }
        else{
            let CityListObj = {Country: data[i].Country, Display: false, City: data[i].City, CitySelected: false, key: Math.random() + i, NumOfCompanies: 1, Companies:[data[i].CompanyName]};
            CityList.push(CityListObj);
        }
    }
    CityList.sort(this.sort_array_by('NumOfCompanies', true, function(a){
        //Since I'm sorting by NumOfCities which is an integer I need to return a blank integer for the swap needed inside the sort
        return parseInt(a);
     }));
     return CityList;
  }

  parseDataCompanies(data) { 
    let lng = data.length;
    let CompanyList = [];
    for (var i = 0; i < lng; i++) {
        let obj = CompanyList.find(x => x.CompanyName === data[i].CompanyName);
        let index = CompanyList.indexOf(obj);
        if(index < 0){
            let CompanyListObj = {
                City: data[i].City, 
                Display: false, 
                Company: data[i].CompanyName, 
                CompanySelected: false, 
                key: Math.random() + i, 
                CompanyAddress: data[i].Address + ", " +  data[i].City + ", " + data[i].Country,
                Position: {latitude: 0, longitude: 0}
            };
            CompanyList.push(CompanyListObj);
        }
    }
    CompanyList.sort(this.AlphabeticalSort("Company"));
    return CompanyList;
  }

  onLoad = async data => {
    this.setState({
        Countries: this.parseDataCountries(data.Customers),
        Cities: this.parseDataCities(data.Customers),
        Companies: this.parseDataCompanies(data.Customers)
    });
    //make sure after the sort that all Cities array elements corresponding to the first country (CountrySelected) are picked
    this.setState(state => {
        let CityList = [...state.Cities];
        let lngCities = CityList.length;
        let CTIndex = 0;
        for (var i = lngCities; i >= 0; i--) {
            if(CityList[i] !== undefined){
                CityList[i].CitySelected = false;
                if (CityList[i].Country === state.Countries[0].Country){
                    CityList[i].Display = true;
                    CTIndex = i;
                }else{
                    CityList[i].Display = false;
                }
            }
        }
        CityList[CTIndex].CitySelected = true;

        return {
            Countries: state.Countries,
            Cities: CityList,
            Companies: state.Companies,
            CountryIndex: 0,
            CityIndex: CTIndex
        };
    });
    //make sure after the sort that the first element of the Companies array corresponding to the first city (CitySelected) 
    //that is corresponding to the first country (CountrySelected) is picked
    await this.setState(async state => {
        let CompanyList = [...state.Companies];
        let lngCompanies = CompanyList.length;
        let SelectIndex = 0;
        for (var i = lngCompanies; i >= 0; i--) {
            if(CompanyList[i] !== undefined){
                CompanyList[i].CompanySelected = false;
                if (CompanyList[i].City === state.Cities[state.CityIndex].City){
                    CompanyList[i].Display = true;
                    SelectIndex = i;
                }else{
                    CompanyList[i].Display = false;
                }
            }
        }
        CompanyList[SelectIndex].CompanySelected = true;

        //Use the geocoder with the Google API Key to get the position of the selected company
        const geo = geocoder({
            key: "AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRrs", //Google API Key
          });
        //the geo.find function from the geocoder object converts the address to a set of latitude and longitude (Position) 
        let PositionObj = await geo.find(CompanyList[SelectIndex].CompanyAddress, (err, res) => {
            let pos = {latitude: 0, longitude: 0};
            if (err) {
              console.error(err);
              return pos;   
            } else {
              if(res[0] !== undefined){
                let latitude = res[0].location.lat;
                let longitude = res[0].location.lng;
                pos = {latitude, longitude};
                console.log("inside", pos);
                return pos;
              }
            }}); 
        // this.FindLatLong(CompanyList[SelectIndex].CompanyAddress, function(data) {
        //     if(data !== undefined){
        //         console.log(data);
        //         CompanyList[SelectIndex].Position = data;
        //     } else{
        //         console.log("didn't work");
        //     } 
        // }); 

        return {
            Countries: state.Countries,
            Cities: state.Cities,
            Companies: CompanyList,
            CountryIndex: 0,
            CityIndex: state.CityIndex
        };
    });
  };

  async CountryhandleCheck(e) {
    let obj = this.state.Countries.find(x => x.Country === e.currentTarget.dataset.id);
    let index = this.state.Countries.indexOf(obj);
    await this.setState(state => {
        let arrayCountries = [...state.Countries];
        let lngCountries = arrayCountries.length;
        let SelectIndex = 0;
        for (var i = lngCountries; i >= 0; i--) {
            arrayCountries[i] = { ...arrayCountries[i], CountrySelected: false };
            if (i === index){
                arrayCountries[i] = { ...arrayCountries[i], Display: true };
                SelectIndex = i;
            }else{
                arrayCountries[i] = { ...arrayCountries[i], Display: false };
            }
        }
        arrayCountries[SelectIndex].CountrySelected = true;

        let arrayCities = [...state.Cities];
        let lngCities = arrayCities.length;
        let CTIndex = 0;
        for (var y = lngCities; y >= 0; y--) {
            if(arrayCities[y] !== undefined){
                arrayCities[y] = { ...arrayCities[y], CitySelected: false };
                if (arrayCities[y].Country === arrayCountries[state.CountryIndex].Country){
                    arrayCities[y] = { ...arrayCities[y], Display: true };
                    SelectIndex = y;
                    CTIndex = y;
                }else{
                    arrayCities[y] = { ...arrayCities[y], Display: false };
                }
            }
        }
        arrayCities[SelectIndex].CitySelected = true;

        let arrayCompanies = [...state.Companies];
        let lngCompanies = arrayCompanies.length;
        for (var z = lngCompanies; z >= 0; z--) {
            arrayCompanies[z] = { ...arrayCompanies[z], CompanySelected: false };
            if (arrayCompanies[z].City === arrayCities[CTIndex].City){
                arrayCompanies[z] = { ...arrayCompanies[z], Display: true };
                SelectIndex = z;
            }else{
                arrayCompanies[z] = { ...arrayCompanies[z], Display: false };
            }
        }
        arrayCompanies[SelectIndex].CompanySelected = true;

        return {
            Countries: arrayCountries,
            Cities: arrayCities,
            Companies: arrayCompanies,
            CountryIndex: index,
            CityIndex: CTIndex
        };
      });
    //console.log(e.currentTarget);
    //return e.currentTarget.dataset.id;
  }

  async CityhandleCheck(e) {
    let obj = this.state.Cities.find(x => x.City === e.currentTarget.dataset.id);
    let index = this.state.Cities.indexOf(obj);
    await this.setState(state => {
        let arrayCities = [...state.Cities];
        let lngCities = arrayCities.length;
        let SelectIndex = 0;
        for (var i = lngCities; i >= 0; i--) {
            arrayCities[i] = { ...arrayCities[i], CitySelected: false };
            if (i === index){
                arrayCities[i] = { ...arrayCities[i], display: true };
                SelectIndex = i;
            }else{
                arrayCities[i] = { ...arrayCities[i], display: false };
            }
        }
        arrayCities[SelectIndex].CitySelected = true;

        let arrayCompanies = [...state.Companies];
        let lngCompanies = arrayCompanies.length;
        for (var y = lngCompanies; y >= 0; y--) {
            arrayCompanies[y] = { ...arrayCompanies[y], CompanySelected: false };
            if (arrayCompanies[y].City === arrayCities[index].City){
                arrayCompanies[y] = { ...arrayCompanies[y], Display: true };
                SelectIndex = y;
            }else{
                arrayCompanies[y] = { ...arrayCompanies[y], Display: false };
            }
        }
        arrayCompanies[SelectIndex].CompanySelected = true;

        return {
            Countries: state.Countries,
            Cities: arrayCities,
            Companies: arrayCompanies,
            CountryIndex: state.CountryIndex,
            CityIndex: index
        };
      });
    //return e.currentTarget.dataset.id;
  }

  async CompanyhandleCheck(e) {
    let obj = this.state.Companies.find(x => x.Company === e.currentTarget.dataset.id);
    let index = this.state.Companies.indexOf(obj);
    await this.setState(state => {
        let arrayCompanies = [...state.Companies];
        let lngCompanies = arrayCompanies.length;
        let SelectIndex = 0;
        for (var i = lngCompanies; i >= 0; i--) {
            arrayCompanies[i] = { ...arrayCompanies[i], CompanySelected: false };
            if (i === index){
                arrayCompanies[i] = { ...arrayCompanies[i], Display: true };
                SelectIndex = i;
            }else{
                arrayCompanies[i] = { ...arrayCompanies[i], Display: false };
            }
        }
        arrayCompanies[SelectIndex].CompanySelected = true;

        return {
            Countries: state.Countries,
            Cities: state.Cities,
            Companies: arrayCompanies,
            CountryIndex: state.CountryIndex,
            CityIndex: state.CityIndex
        };
      });
    //return e.currentTarget.dataset.id;
  }

  render() {
    // const SimpleGoogleMap = withGoogleMap(props => (
    //     <GoogleMap
    //       googleMapUrl={this.state.googleMapUrl}
    //       zoom={props.zoom}
    //       center={props.center}
    //     />
    // ));
    // const SimpleGoogleMap = withGoogleMap(props => (
    //     <GoogleMap
    //       googleMapUrl={this.state.googleMapUrl}
    //       zoom={this.state.zoom}
    //       center={this.state.center}
    //     />
    // ));    
    // const SimpleGoogleMap = () =>
    //         <ReactGoogleMapLoader
    //             params={{
    //                 key: this.state.APIKey, // Define your api key here
    //                 libraries: "places,geometry", // To request multiple libraries, separate them with a comma
    //             }}
    //             render={googleMaps =>
    //                 googleMaps && (
    //                 <div>Google Maps is loaded !</div>
    //             )}
    //         />

    if (this.state.Countries){ 
        if(this.state.Countries.length > 0){
            return (
                <div className="Container">
                    <div className="header-1"><div className="header">Countries</div></div>
                    <div className="header-1"><div className="header">Cities</div></div>
                    <div className="header-1"><div className="header">Companies</div></div>
                    <div className="header-2"><div className="header">Map</div></div>
                    <div className="column-1">
                        {this.state.Countries.map(item => (
                            <div onClick={this.CountryhandleCheck} className={item.CountrySelected ? 'Selected' : 'NotSelected' } data-id={item.Country} key={item.key}>
                            {/*console.log(item.Country, item.CountrySelected)*/}        
                            {item.Country} {item.NumOfCities}
                            </div>
                        ))}
                    </div>
                    <div className="column-1">
                        {this.state.Cities.map(item => (
                            <div style={{ display: item.Display ? 'block' : 'none' }} onClick={this.CityhandleCheck} className={ item.CitySelected ? 'Selected' : 'NotSelected' } data-id={item.City} key={item.key}>
                            {/*console.log(item.City, item.CitySelected)*/}        
                            {item.Country} {item.City} {item.NumOfCompanies}
                            </div>
                        ))}
                    </div> 
                    <div className="column-1">
                        <div>
                        {this.state.Companies.map(item => (
                            <div style={{ display: item.Display ? 'block' : 'none' }} className={item.CompanySelected ? 'Selected' : 'NotSelected' } data-id={item.Company} key={item.key}>
                                {item.City} {item.Company}
                            </div>
                        ))}
                        </div>
                    </div>
                    
                    <div className="column-2">   
                        {/*
                        <SimpleGoogleMap
                            containerElement={
                                <div className="mapContainer" />
                            }
                            mapElement={
                                <div className="map" />
                            }
                        />
                        */}
                        {/*
                        <ReactGoogleMapLoader
                            params={{
                            key: this.state.APIKey, // Define your api key here
                            libraries: "places,geometry", // To request multiple libraries, separate them with a comma
                            }}
                            render={googleMaps =>
                            googleMaps && (
                            <div>Google Maps is loaded !</div>
                            )}
                        />
                        */}
                        {map}
                    </div> 
                       
                    {/* 
                    <div className="column-2">
                        <img src="https://i1.wp.com/www.cssscript.com/wp-content/uploads/2018/03/Simple-Location-Picker.png?fit=561%2C421&ssl=1" alt="map" />
                    </div>
                    */}
                </div>
            );
        } else {
            return <div className="Container">Loading...</div>;
        }  
    } else {
        this.renderLoading();
    }
  }

  renderLoading() {
    return <div>Loading...</div>;
  }
}

export default List;