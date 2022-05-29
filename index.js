// Write you code here
const axios = require('axios');

hasMoutains = function(planet) {
    if(planet.terrain.includes("mountain")) {
        return true;
    }
    return false;
}

hasSurfaceWater = function(planet) {
    if(!isNaN(planet.surface_water) && planet.surface_water > 0) { // There is a case of surface_water : "unknown"
        return true;
    }
    return false;
}

// --- MAIN PROGRAM --

const params = [hasMoutains, hasSurfaceWater]; // You can change params to check different datas
const args = process.argv.slice(2);
try {
    checkArgs(args);
    const filmNb = args[0];
    getPlanetTotalDiameterWithParams(filmNb, params);
} catch (err) {
    console.error(err.message);
}

// --- END MAIN PROGRAM ---

function checkArgs(args) {
    if(args.length !== 1) {
        throw new Error("Only one parameter is required : the SW film number");
    } else if(isNaN(args[0])) {
        throw new Error("Please give a number as parameter !");
    }
}

function getStarWarsData(url) {
    return new Promise((resolve, reject) => {
        axios.get(url)
        .then(response => {
            resolve(response);
        })
        .catch(error => {
            reject(error);
        });
    });
}

function getPlanetTotalDiameterWithParams(filmNb, params) {
    // Get planets data for a specific films
    getStarWarsData(`https://swapi.dev/api/films/${filmNb}/`).then(film => {
        let planetPromises = [];
        const planetsUrl = film.data.planets;
        planetsUrl.forEach(planetUrl => {
            // Get each planet data
            planetPromises.push(getStarWarsData(planetUrl));
        });
        Promise.all(planetPromises).then(planets => {
            let resultPlanets = [];
            let totalDiameter = 0;
            let message = "";
            // For each planet, check the params
            planets.forEach(planet => {
                const {name, diameter} = planet.data;
                let paramPassed = 0;
                params.forEach(param => {
                    if (param(planet.data)) {
                        paramPassed ++;
                    }
                });
                if (paramPassed === params.length) { // If every pre-established conditions are true, do the following
                    resultPlanets.push({name, diameter}); // Add the planet to a list
                    totalDiameter += +diameter; // Add its diameter to the current count
                    message += `- ${name}, diameter: ${diameter}\n`; // Process the message that will be shown at the end.
                    // In this case we don't have to make another forEach at the end.
                }
            }); 
            if(resultPlanets) {
                message += `Total diameter ${totalDiameter}`;
            }
            printResultMessage(filmNb, resultPlanets, message);
        });
    }).catch(() => {
        console.error("This film doesn't exist or isn't supported by the API");
    });
}

function printResultMessage(filmNb, planets, message) {
    if (planets) {
        console.log(`In Film #${filmNb} there is/are ${planets.length} planet(s) that has/have mountains and a water surface (> 0).`);
        if(planets.length > 0) {
            console.log(message);
        }
    } else {
        console.log(`In Film #${filmNb} there is no planet that has mountains and a water surface (> 0).`);
    }
}