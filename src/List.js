import React, { Component } from 'react';
import SimpleMap from '../src/map';

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Countries: [],
            Cities: [],
            Companies: [],
            CountryIndex: 0,
            CityIndex: 0,
            CompanyIndex: 0
        };
        this.sort_array_by = this.sort_array_by.bind(this);
        this.AlphabeticalSort = this.sort_array_by.bind(this);
        this.parseDataCountries = this.parseDataCountries.bind(this);
        this.parseDataCities = this.parseDataCities.bind(this);
        this.parseDataCompanies = this.parseDataCompanies.bind(this);
        this.CountryhandleCheck = this.CountryhandleCheck.bind(this);
        this.CityhandleCheck = this.CityhandleCheck.bind(this);
        this.CompanyhandleCheck = this.CompanyhandleCheck.bind(this);  
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
                CompanyAddress: data[i].Address + ", " +  data[i].City + ", " + data[i].Country
            };
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
    let CityList = this.state.Cities;
    let lngCities = CityList.length;
    let CTIndex = 0;
    for (var i = lngCities; i >= 0; i--) {
        if(CityList[i] !== undefined){
            CityList[i].CitySelected = false;
            if (CityList[i].Country === this.state.Countries[0].Country){
                CityList[i].Display = true;
                CTIndex = i;
            }else{
                CityList[i].Display = false;
            }
        }
    }
    CityList[CTIndex].CitySelected = true;

    this.setState({ 
        Cities: CityList,
        CityIndex: CTIndex });

    //make sure after the sort that the first element of the Companies array corresponding to the first city (CitySelected) 
    //that is corresponding to the first country (CountrySelected) is picked
    let CompanyList = this.state.Companies;
    let lngCompanies = CompanyList.length;
    let CompIndex = 0;
    for (var y = lngCompanies; y >= 0; y--) {
        if(CompanyList[y] !== undefined){
            CompanyList[y].CompanySelected = false;
            if (CompanyList[y].City === this.state.Cities[this.state.CityIndex].City){
                CompanyList[y].Display = true;
                CompIndex = y;
            }else{
                CompanyList[y].Display = false;
            }
        }
    }
    CompanyList[CompIndex].CompanySelected = true;
    
    this.setState({ 
        Companies: CompanyList,
        CompanyIndex: CompIndex });
  };

  CountryhandleCheck(e) {
    let obj = this.state.Countries.find(x => x.Country === e.currentTarget.dataset.id);
    let index = this.state.Countries.indexOf(obj);
    
    //Update all 3 arrays to reflect the change in country
    let arrayCountries = this.state.Countries;
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

    let arrayCities = this.state.Cities;
    let lngCities = arrayCities.length;
    let CTIndex = 0;
    for (var y = lngCities; y >= 0; y--) {
        if(arrayCities[y] !== undefined){
            arrayCities[y] = { ...arrayCities[y], CitySelected: false };
            if (arrayCities[y].Country === arrayCountries[SelectIndex].Country){
                arrayCities[y] = { ...arrayCities[y], Display: true };
                CTIndex = y;
            }else{
                arrayCities[y] = { ...arrayCities[y], Display: false };
            }
        }
    }
    arrayCities[CTIndex].CitySelected = true;

    let arrayCompanies = this.state.Companies;
    let lngCompanies = arrayCompanies.length;
    let CompIndex = 0;
    for (var z = lngCompanies; z >= 0; z--) {
        arrayCompanies[z] = { ...arrayCompanies[z], CompanySelected: false };
        if (arrayCompanies[z].City === arrayCities[CTIndex].City){
            arrayCompanies[z] = { ...arrayCompanies[z], Display: true };
            CompIndex = z;
        }else{
            arrayCompanies[z] = { ...arrayCompanies[z], Display: false };
        }
    }
    arrayCompanies[CompIndex].CompanySelected = true;

    //set the new state for all 3 arrays
    this.setState({ 
        Countries: arrayCountries,
        Cities: arrayCities,
        Companies: arrayCompanies,
        CountryIndex: index,
        CityIndex: CTIndex, 
        CompanyIndex: CompIndex})    
    //console.log(e.currentTarget);
    //return e.currentTarget.dataset.id;
  }

   CityhandleCheck(e) {
    let obj = this.state.Cities.find(x => x.City === e.currentTarget.dataset.id);
    let index = this.state.Cities.indexOf(obj);

    let arrayCities = this.state.Cities;
    let lngCities = arrayCities.length;
    let CTIndex = 0;
    for (var i = lngCities; i >= 0; i--) {
        arrayCities[i] = { ...arrayCities[i], CitySelected: false };
        if (i === index){
            arrayCities[i] = { ...arrayCities[i], display: true };
            CTIndex = i;
        }else{
            arrayCities[i] = { ...arrayCities[i], display: false };
        }
    }
    arrayCities[CTIndex].CitySelected = true;

    let arrayCompanies = this.state.Companies;
    let lngCompanies = arrayCompanies.length;
    let CompIndex = 0;
    for (var y = lngCompanies; y >= 0; y--) {
        arrayCompanies[y] = { ...arrayCompanies[y], CompanySelected: false };
        if (arrayCompanies[y].City === arrayCities[index].City){
            arrayCompanies[y] = { ...arrayCompanies[y], Display: true };
            CompIndex = y;
        }else{
            arrayCompanies[y] = { ...arrayCompanies[y], Display: false };
        }
    }
    arrayCompanies[CompIndex].CompanySelected = true;

    //set the new state for 2 arrays
    this.setState({ 
        Cities: arrayCities,
        Companies: arrayCompanies,
        CityIndex: CTIndex, 
        CompanyIndex: CompIndex }) 

    //return e.currentTarget.dataset.id;
  }

  CompanyhandleCheck(e) {
    let obj = this.state.Companies.find(x => x.Company === e.currentTarget.dataset.id);
    let index = this.state.Companies.indexOf(obj);

    let arrayCompanies = this.state.Companies;
    let lngCompanies = arrayCompanies.length;
    for (var i = lngCompanies; i >= 0; i--) {
        arrayCompanies[i] = { ...arrayCompanies[i], CompanySelected: false };
        if (arrayCompanies[i].City === this.state.Cities[this.state.CityIndex].City){
            arrayCompanies[i] = { ...arrayCompanies[i], Display: true };
        }else{
            arrayCompanies[i] = { ...arrayCompanies[i], Display: false };
        }
    }
    arrayCompanies[index].CompanySelected = true;

    this.setState({
        Companies: arrayCompanies,
        CompanyIndex: index
    })

    //return e.currentTarget.dataset.id;
  }

  render() {
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
                            <div onClick={this.CountryhandleCheck} className={item.CountrySelected ? 'Selected' : 'NotSelected' } data-id={item.Country} key={item.index}>
                            {/*console.log(item.Country, item.CountrySelected)*/}        
                            {item.Country} {item.NumOfCities}
                            </div>
                        ))}
                    </div>
                    <div className="column-1">
                        {this.state.Cities.map(item => (
                            <div style={{ display: item.Display ? 'block' : 'none' }} onClick={this.CityhandleCheck} className={ item.CitySelected ? 'Selected' : 'NotSelected' } data-id={item.City} key={item.index}>
                            {/*console.log(item.City, item.CitySelected)*/}        
                            {item.Country} {item.City} {item.NumOfCompanies}
                            </div>
                        ))}
                    </div> 
                    <div className="column-1">
                        <div>
                        {this.state.Companies.map(item => (
                            <div style={{ display: item.Display ? 'block' : 'none' }}  onClick={this.CompanyhandleCheck} className={item.CompanySelected ? 'Selected' : 'NotSelected' } data-id={item.Company} key={item.index}>
                                {item.City} {item.Company}
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className="column-2">   
                        <div id="map">
                            {/*<SimpleMap mapSize={{height: '81vh', width: '60vw'}} lat={45.5154586} lng={-122.6793461}/>*/}
                            {console.log("passed company: ",this.state.Companies[this.state.CompanyIndex].Company)}
                            <SimpleMap Address={this.state.Companies[this.state.CompanyIndex].CompanyAddress}/>
                        </div>
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