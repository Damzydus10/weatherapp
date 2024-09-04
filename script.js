const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton= document.querySelector(".location-btn");
const currentWeatherDiv= document.querySelector(".current-weather");
const weatherCardsDiv= document.querySelector(".weather-cards");
const API_key = "33318b40a484e0a2e59e13a2d7050e04";
const createWeatherCard=(cityName, weatherItem,index)=>{
    if(index === 0){ //html for the main weather card
                return `  <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity} % </h4>
            </div>
            <div class="icon"> 
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png"  alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;

    }else{ //html for the other five days forecast card
        return ` <li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity} % </h4>
        </li>`;
    }
   
}
const getWeatherDetails=(cityName, lat,lon)=>{
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`
    fetch (WEATHER_API_URL).then(res=>res.json()).then(data=>{
      
      //filter the forecast to get one forecast per day

        const uniqueForcastDays = [];
        const fiveDaysForecast = data.list.filter(forecast=>{
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForcastDays.includes(forecastDate)){
               return uniqueForcastDays.push(forecastDate)
            }
        });

        //clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

//creating weather cards and adding them to DOM
        fiveDaysForecast.forEach((weatherItem, index)=>{
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",  createWeatherCard(cityName,weatherItem, index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",  createWeatherCard(cityName,weatherItem, index));
            }
            
           
        });
    }).catch(()=>{
        alert("an error occured while fetching weather forecast");
    });
}
const getCityCooordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL= `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`
    //get city name from coordinates using reverse geocoding API
    fetch(GEOCODING_API_URL).then(res=> res.json()).then(data=>{
        if (!data.length) return  alert(`no coordinates found for ${cityName}`);
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat,lon);
        
    }).catch(()=>{
        alert("an error occured while fetching the coordinates")
    });
    
}
const getUserCooordinates = ()=>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            fetch(REVERSE_GEOCODING_URL).then(res=> res.json()).then(data=>{
                const {name} = data[0];
                getWeatherDetails(name,latitude, longitude);
              }).catch(()=>{
                alert("an error occured while fetching the city")
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.")
            }
        }
    );
}

locationButton.addEventListener("click", getUserCooordinates);
searchButton.addEventListener("click", getCityCooordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCooordinates());