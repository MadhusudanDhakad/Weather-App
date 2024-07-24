const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userWeather = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-access-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundContainer = document.querySelector(".not-found-container");


let oldTab = userTab;
let API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getFromSessionStorage();


function switchTab(newTab) {
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
})

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
})


// -----------------------user-weather-handle-----------------------------

const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");
const messageText = document.querySelector("[data-messageText]");
const apiErrMsg = document.querySelector("[data-errMessage]");
const apiErrorImg = document.querySelector("[data-apiErrorImg]");
const apiRetryBtn = document.querySelector("[data-apiRetryBtn]");


function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}



function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else {
        //HW - show an alert for no gelolocation support available
        grantAccessButton.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

// Handle any errors
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  }

getFromSessionStorage();

grantAccessButton.addEventListener("click", getLocation);



async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    console.log(lat,lon);
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    notFoundContainer.classList.remove("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();
        
        if(!data.sys){
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        notFoundContainer.classList.add("active");
        apiErrorImg.style.display = 'none';
        apiErrMsg.innerText = `Error: ${err?.message}`;
        apiRetryBtn.addEventListener("click", fetchUserWeatherInfo);
    }

}

function renderWeatherInfo(weatherInfo) {
    const cityName =  document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon  =  document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    // windSpeed.innerText = `${weatherInfo?.wind?.speed}` + 'm/s';
    windSpeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}



searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // let cityName = searchInput.value;

    if(searchInput.value === "")
        return;
        
    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";
})

// async function fetchSearchWeatherInfo(city) {
//     loadingScreen.classList.add("active");
//     userInfoContainer.classList.remove("active");
//     grantAccessContainer.classList.remove("active");

//     try {
//         const response = await fetch(
//             `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
//           );
//           const data = await response.json();
//           loadingScreen.classList.remove("active");
//           userInfoContainer.classList.add("active");
//           renderWeatherInfo(data);
//     }
//     catch(err) {
//         loadingScreen.classList.remove("active");
//         notFoundContainer.classList.add("active");
//         console.error(err);
//     }
// }

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFoundContainer.classList.remove("active"); // Make sure it's hidden initially

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        notFoundContainer.classList.add("active");
        apiErrMsg.innerText = `${error?.message}`;
        apiRetryBtn.style.display = "none";
    }
}

const container = document.querySelector(".container");
const modeBtn = document.querySelector("[data-themeMode]");
const moonBtn = document.getElementById("moon");
const sunBtn = document.getElementById("sun");

sunBtn.classList.add("active");
container.classList.add("dark-mode");
searchTab.classList.add("dark-mode");
searchForm.classList.add("dark-mode");

modeBtn.addEventListener("click", () => {
    if(container.classList.contains("dark-mode")) {
        sunBtn.classList.remove("active");
        moonBtn.classList.add("active");
        container.classList.remove("dark-mode");
        searchTab.classList.remove("dark-mode");
        searchForm.classList.remove("dark-mode");
        container.classList.add("light-mode");
        searchTab.classList.add("light-mode");
        searchForm.classList.add("light-mode");
    }
    else {
        sunBtn.classList.add("active");
        moonBtn.classList.remove("active");
        searchTab.classList.remove("light-mode");
        container.classList.remove("light-mode");
        searchForm.classList.remove("light-mode");
        container.classList.add("dark-mode");
        searchTab.classList.add("dark-mode");
        searchForm.classList.add("dark-mode");
    }
});
