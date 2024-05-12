import * as turf from '@turf/turf';
import * as topojson from 'topojson-client';
import data from '../../public/cantoni/cantoni.json';
import cantoniInfo from '../../public/cantoni/cantoni-info.json';
const debug = false; 


async function createGeoapifyRequest(address) {
    try {
        const encodedAddress = encodeURIComponent(address);
        const apiKey = "06731d7c24044a51a73ad31c7f3589bc";
        const apiUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodedAddress}&format=json&apiKey=${apiKey}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching Geoapify data:', error);
        throw error;
    }
}

async function getAreaNameForCoordinate(coordinate, topoJSONData) {
    try {
        // Ensure that topoJSONData has objects property
        if (!topoJSONData || !topoJSONData.objects || !topoJSONData.objects.Copia_di_Mappa_Torneo_dei_Cantoni) {
            throw new Error('Invalid TopoJSON format or missing object');
        }

        // Extract the relevant object
        const geoJSONData = topojson.feature(topoJSONData, topoJSONData.objects.Copia_di_Mappa_Torneo_dei_Cantoni);

        // Create a point feature from the coordinate
        const point = turf.point(coordinate);

        // Loop through each feature in the GeoJSON data
        for (const feature of geoJSONData.features) {
            // Check if the point is within the feature
            if (turf.booleanPointInPolygon(point, feature.geometry)) {
                return feature.properties.Name; // Return the name of the area
            }
        }

        return 'Error: Coordinate is not within any area'; // Return error message
    } catch (error) {
        console.error('Error processing TopoJSON data:', error);
        throw error;
    }
}

export async function cantoneFinder(address) {
    try {

        console.log('Script started'); 
        
        var geoapifyResponse = await createGeoapifyRequest(address);
        console.log(geoapifyResponse); 
       
        const response = geoapifyResponse.results.filter(e => {
            //Filter rules
            return e.city == 'Centallo' && e.result_type == 'building'; 
        })

        // Example usage:
        const coordinate = [geoapifyResponse.results[0].lon, geoapifyResponse.results[0].lat];
        console.log(data);
        // Fetch the TopoJSON file
        //const topoJSONResponse = fetch('/cantoni/cantoni.topojson?url').then((response) => response.json()).then((json) => console.log(json));
        
        if (!data) {
            throw new Error(`Failed to fetch TopoJSON file: ${topoJSONResponse.statusText}`);
        }
        
        


        // Find the area name for the coordinate
        const areaName = await getAreaNameForCoordinate(coordinate, data);
        const cantoneInfo = addInfo(areaName); 
        console.log(cantoneInfo);
        return cantoneInfo;
    } catch (error) {
        console.error('Error:', error);
    }
}


function addInfo(response){
    for (const cantoneName in cantoniInfo.cantoni) {
        const cantone = cantoniInfo.cantoni[cantoneName];
        if (cantone.name && cantone.name === response) {
          return cantone;
        }
      }
      return null; // If no match is found
}



