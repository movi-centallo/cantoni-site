import { Geocoder } from 'https://example.com/path/to/script.js';
function geo(address){
    geocoder.geocode( { 'address': address}, function(results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.latitude;
            var longitude = results[0].geometry.location.longitude;
            alert(latitude);
            } 
        }); 


}

const result = geo("Via Pearda 44, Centallo"); 
console.log(result); 