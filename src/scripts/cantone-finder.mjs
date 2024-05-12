import * as turf from '@turf/turf';
import * as topojson from 'topojson-client';
import data from '../../public/cantoni/cantoni.json';
import cantoniInfo from '../../public/cantoni/cantoni-info.json';


/*
Filtri: 
-Tipologie dati accettate: 'building' or 'street' [✓]


Errori da scatenare: 

-Risposta/Richiesta con paese diverso da Centallo [✓]
-Via inesistente in Centallo [✓]
-Coordinate GPS non hanno corrispondenza con un area (sebbene passino dal decodificatore di coordinate)



*/
async function createGeoapifyRequest(address) {
    try {
        const encodedAddress = encodeURIComponent(address);
        const apiKey = "06731d7c24044a51a73ad31c7f3589bc";
        const apiUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodedAddress}&postcode=12044&limit=3&format=json&apiKey=${apiKey}`;
        
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
        console.log(geoapifyResponse.results);
        console.log(typeof geoapifyResponse.results);

        const response = geoapifyResponse.results.filter((e) => {
            //Filter rules
            return (e.result_type === "building" || e.result_type ===  "street" || e.result_type === "postcode"); 
        });
        
        console.log("Risposta");
        console.log(response); 
        
        if(response.length == 0){
            const err_return = addInfo("not_found", true);
            console.log(err_return); 
            return err_return;
            
        }


        // Example usage:
        const coordinate = [response[0].lon, response[0].lat];
        console.log(data);
        // Fetch the TopoJSON file
        //const topoJSONResponse = fetch('/cantoni/cantoni.topojson?url').then((response) => response.json()).then((json) => console.log(json));
        
        if (!data) {
            throw new Error(`Failed to fetch TopoJSON file: ${topoJSONResponse.statusText}`);
        }
        
        


        // Find the area name for the coordinate
        const areaName = await getAreaNameForCoordinate(coordinate, data);
        
        console.log(areaName);
        const cantoneInfo = addInfo(areaName, false); 
        
        return cantoneInfo;

    } catch (error) {
        console.error('Error:', error);
    }
}


function addInfo(response, flag_error){
    if(flag_error){
        for (const err in cantoniInfo.error) {
            if(response===err){
                console.log(err);
                return cantoniInfo.error[err];}
            
          }
          throw new Error('Failed to find error-corrispondece in the cantoni-info file');
    }
    
    for (const cantoneName in cantoniInfo.cantoni) {
        const cantone = cantoniInfo.cantoni[cantoneName];
        if (cantone.name && cantone.name === response) {
          return cantone;
        }
      }
      throw new Error('Failed to find corrispondece in the cantoni-info file');
}



