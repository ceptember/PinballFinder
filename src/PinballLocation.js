import React from "react";

function PinballLocation({location}){

    return (
        <div id = "pinball_location_div">
            <h3>{ location.website ? <a href={location.website}  target="_blank">{location.name}</a> : location.name}  <br /></h3>
            {location.street} <br />
            {location.city}, {location.state} {location.zip} <br />
            {location.distance} miles away

            <br />

            <br />
             
        </div>
    )
}

export default PinballLocation; 