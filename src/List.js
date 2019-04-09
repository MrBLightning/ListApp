import React, { Component } from 'react';
import { GoogleMap, withGoogleMap } from 'react-google-maps';
import geocoder from 'google-geocoder';

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
    }

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
            //Use the geocoder with the Google API Key to get the position of each company
            const geo = geocoder({
                key: "AIzaSyAgkg5LJYfuOLhqYdQIVxNUHLDCzJdSRrs", //Google API Key
              });
            let CompanyListObj = {
                City: data[i].City, 
                Display: false, 
                Company: data[i].CompanyName, 
                CompanySelected: false, 
                key: Math.random() + i, 
                CompanyAddress: data[i].Address + ", " +  data[i].City + ", " + data[i].Country,
                Position: geo.find(data[i].Address + ", " +  data[i].City + ", " + data[i].Country, (err, res) => {
                    let pos = {latitude: 0, longitude: 0};
                    if (err) {
                      console.error(err);
                      return pos;   
                    } else {
                      if(res[0] !== undefined){
                        let latitude = res[0].location.lat;
                        let longitude = res[0].location.lng;
                        pos = {latitude, longitude};
                        //console.log(pos);
                        return pos;
                      }
                    }})
            };
            console.log(CompanyListObj);
            CompanyList.push(CompanyListObj);
        }
    }
    CompanyList.sort(this.AlphabeticalSort("Company"));
    return CompanyList;
  }

  onLoad = data => {
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
                if (CityList[i].Country === state.Countries[0].Country){
                    CityList[i].Display = true;
                    CTIndex = i;
                }else{
                    CityList[i].Display = false;
                }
            }
        }

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
    this.setState(state => {
        let CompanyList = [...state.Companies];
        let lngCompanies = CompanyList.length;
        for (var i = 0; i < lngCompanies; i++) {
            if (CompanyList[i].City === state.Cities[state.CityIndex].City){
                CompanyList[i].Display = true;
            }else{
                CompanyList[i].Display = false;
            }
        }

        return {
            Countries: state.Countries,
            Cities: state.Cities,
            Companies: CompanyList,
            CountryIndex: 0,
            CityIndex: state.CityIndex
        };
    });
  };

  CountryhandleCheck(e) {
    let obj = this.state.Countries.find(x => x.Country === e.currentTarget.dataset.id);
    let index = this.state.Countries.indexOf(obj);
    this.setState(state => {
        let arrayCountries = [...state.Countries];
        let lngCountries = arrayCountries.length;
        for (var i = 0; i < lngCountries; i++) {
            if (i === index){
                arrayCountries[i] = { ...arrayCountries[i], CountrySelected: true };
            }else{
                arrayCountries[i] = { ...arrayCountries[i], CountrySelected: false };
            }
        }
        let arrayCities = [...state.Cities];
        let lngCities = arrayCities.length;
        let CTIndex = 0;
        for (var y = lngCities; y >= 0; y--) {
            if(arrayCities[y] !== undefined){
                if (arrayCities[y].Country === arrayCountries[state.CountryIndex].Country){
                    arrayCities[y] = { ...arrayCities[y], Display: true };
                    CTIndex = y;
                }else{
                    arrayCities[y] = { ...arrayCities[y], Display: false };
                }
            }
        }
        let arrayCompanies = [...state.Companies];
        let lngCompanies = arrayCompanies.length;
        for (var z = 0; z < lngCompanies; z++) {
            if (arrayCompanies[z].City === arrayCities[CTIndex].City){
                arrayCompanies[z] = { ...arrayCompanies[z], Display: true };
            }else{
                arrayCompanies[z] = { ...arrayCompanies[z], Display: false };
            }
        }

        return {
            Countries: arrayCountries,
            Cities: arrayCities,
            Companies: arrayCompanies,
            CountryIndex: index,
            CityIndex: CTIndex
        };
      });
    return e.currentTarget.dataset.id;
  }

  CityhandleCheck(e) {
    let obj = this.state.Cities.find(x => x.City === e.currentTarget.dataset.id);
    let index = this.state.Cities.indexOf(obj);
    this.setState(state => {
        let arrayCities = [...state.Cities];
        let lngCities = arrayCities.length;
        for (var i = 0; i < lngCities; i++) {
            if (i === index){
                arrayCities[i] = { ...arrayCities[i], CitySelected: true };
            }else{
                arrayCities[i] = { ...arrayCities[i], CitySelected: false };
            }
        }
        let arrayCompanies = [...state.Companies];
        let lngCompanies = arrayCompanies.length;
        for (var y = 0; y < lngCompanies; y++) {
            if (arrayCompanies[y].City === arrayCities[index].City){
                arrayCompanies[y] = { ...arrayCities[y], Display: true };
            }else{
                arrayCities[y] = { ...arrayCities[y], Display: false };
            }
        }
        return {
            Countries: state.Countries,
            Cities: arrayCities,
            Companies: arrayCompanies,
            CountryIndex: state.CountryIndex,
            CityIndex: index
        };
      });
    return e.currentTarget.dataset.id;
  }

  render() {
    // const SimpleGoogleMap = withGoogleMap(props => (
    //     <GoogleMap
    //       googleMapUrl={this.state.googleMapUrl}
    //       zoom={props.zoom}
    //       center={props.center}
    //     />
    // ));
    const SimpleGoogleMap = withGoogleMap(props => (
        <GoogleMap
          googleMapUrl={this.state.googleMapUrl}
          zoom={this.state.zoom}
          center={this.state.center}
        />
    ));    
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
                            <div onClick={this.CountryhandleCheck} className={{ display: item.CountrySelected ? 'Selected' : '' }} data-id={item.Country} key={item.key}>
                                {item.Country} {item.NumOfCities}
                            </div>
                        ))}
                    </div>
                    <div className="column-1">
                        {this.state.Cities.map(item => (
                            <div style={{ display: item.Display ? 'block' : 'none' }} onClick={this.CityhandleCheck} className={{ display: item.CitySelected ? 'Selected' : '' }} data-id={item.City} key={item.key}>
                                {item.Country} {item.City} {item.NumOfCompanies}
                            </div>
                        ))}
                    </div> 
                    <div className="column-1">
                        <div>
                        {this.state.Companies.map(item => (
                            <div style={{ display: item.Display ? 'block' : 'none' }} className={{ display: item.CompanySelected ? 'Selected' : '' }} data-id={item.Company} key={item.key}>
                                {item.City} {item.Company}
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className="column-2">   
                        <SimpleGoogleMap
                            containerElement={
                                <div className="mapContainer" />
                            }
                            mapElement={
                                <div className="map" />
                            }
                        />
                    </div>    
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