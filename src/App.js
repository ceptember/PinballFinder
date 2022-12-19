import './App.css';
import { useState } from 'react';
import PinballLocation from './PinballLocation'; //These are the cards that display info for each location 

/* Several functions below for determining the distance in miles between two points by lat and lon */ 

// Needed for distance functions 
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// // 1 degree latitude is always 69 miles, but 1 longitude depends on the latitude 
function milesPerDegLong(latitude){ 
  let latRad = deg2rad(latitude)
  let milesPerDegreeAtEquator = 69
  return Math.cos(latRad) * milesPerDegreeAtEquator //in degrees per mile 
}

function degLongPerMile(latitude){
  return 1 / milesPerDegLong(latitude) 
}

//Distance between two points on the earth 
function getDistanceFromLatLonInMi(lat1,lon1,lat2,lon2) {
  let R = 3960; // Radius of the earth in miles
  let dLat = deg2rad(lat2-lat1);  // deg2rad below
  let dLon = deg2rad(lon2-lon1); 
  let a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let d = R * c; // Distance in miles
  return d;
}

function App() {

  const [latInput, setLatInput] = useState(null) // Latitude from the user input field
  const [longInput, setLongInput] = useState(null) //Longitude from the user input field 
  const [results, setResults] = useState([]) //Results returned from API in bounding box defined by origin location + 20 miles on each side
  const [miles, setMiles] = useState(null) //radius to search 
  const [filteredResults, setFilteredResults] = useState([]) //Filter results by radius searched without re-loading the page
  

  function findByIP(){
    fetch('https://ipapi.co/json') // find the user's location from IP address 
    .then( resp => resp.json()) 
    .then (data => {
       setLatInput(data.latitude)
       setLongInput(data.longitude)
    })
  }

  function handleSearch(event){
    event.preventDefault()   
    searchPinball()
  }
 
  function searchPinball(){
    
    // Building the "bounding box" for the API endpoint url
    let latitude = latInput 
    let longitude = longInput
    let degreesLat = 20/69 
    let degreesLong = degLongPerMile(latitude) * 20  
    let swLat = parseFloat(latitude) - degreesLat
    let swLon = parseFloat(longitude) -degreesLong
    let neLat = parseFloat(latitude) + degreesLat
    let neLon = parseFloat(longitude) + degreesLong
    let url = 'https://pinballmap.com/api/v1/locations/within_bounding_box?swlat='+swLat+'&swlon='+swLon+'&nelat='+neLat+'&nelon='+neLon+'.json'
    console.log(url)
   
    // fetching locations from the API 
    fetch(url)
      .then(response => response.json())
      .then(data => {
        let dataList = data.locations  
        dataList.forEach( (x)=> x.distance = getDistanceFromLatLonInMi(x.lat, x.lon ,latInput,longInput).toFixed(1)) // adding a distance (from search location) attribute in each location object
       
        let sortedResults = dataList.sort( (a,b) =>  a.distance - b.distance) // Sorting the results by distance from search location 
        setResults(sortedResults)
        
        filterResultsByDistance(sortedResults, miles) // Filtering results by distance searched 
      })
}

// filtering results within distance searched. Gets called on "submit" click (along with calling the API), and when the user selects a radius (without another API call or re-load)
function filterResultsByDistance(allResults, distance){
    setMiles(distance)
    if (results){
     setFilteredResults(allResults.filter( x => x.distance <= parseInt(distance))) 
    }
}


  return (
    <div className="App">
              
     <header>PinballFinder</header>

        <br /><br />

        <form onSubmit={ (event) => handleSearch(event)}>
          
          <div>
          Latitude: <input type="text" value={latInput} onChange={ (event)=> setLatInput(event.target.value)} ></input>   &nbsp;
          Longitude: <input type="text" value={longInput} onChange={ (event)=> setLongInput(event.target.value)}></input>  
          <button id="near_me_btn" onClick={findByIP}>Near Me</button>
          </div>

        
          Select distance:
          <input type="radio" name="distance" value="5"  onClick={(e) => filterResultsByDistance(results, e.target.value)  }/>
          <label for="distance1"> 5 miles</label> 

          <input type="radio" name="distance" value="10"  onClick={(e) => filterResultsByDistance(results, e.target.value)  }/>
          <label for="distance1"> 10 miles</label> 
         
          <input type="radio" name="distance" value="20" onClick={(e) => filterResultsByDistance(results, e.target.value) }/> 
          <label for="distance2"> 20 miles </label><br />  

          <input type="submit"></input>
          
        </form>

        
        {filteredResults ? <h4> {filteredResults.length} Results </h4>: ""}
        <ul>

       { filteredResults ? filteredResults.map( x => <li key={x.name}> <PinballLocation location={x} /> </li> ) : ""} 
        </ul>



    </div>
  );
}

export default App;
