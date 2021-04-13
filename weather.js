//tags which connect api to the html page, making it functional
var displayWeather = $("#displayCurrentWeather")
var displayCityInfo = $("#cityInfo")
var displaycTemp = $("#cTemp")
var displaycHumidity = $("#cHumidity")
var displaycWindSpeed = $("#cWindSpeed")
var displaycUVIndex = $('#cUVIndex')
var searchButton = $("#searchButton")
var weatherKey = "883d437755f09951be82a0862fb92242";

// Retrieves weather information for the searched city
function searchWeather(city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + weatherKey
    console.log(queryURL)
    $.ajax({
        type: "GET",
        url: queryURL
    }).then(function (response) {
        //displays city name after search, then temp, humidity and wind
        var date = new Date(
            response.dt * 1000
          ).toLocaleDateString();
          console.log(date);
        var cityName = response.name
        var iconcode = response.weather[0].icon
        var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png"
        console.log(iconurl)
        var temp = response.main.temp
        var humidity = response.main.humidity
        var wind = response.wind.speed.toFixed(0)
        //temperature conversion from kelvin as well as the api 
        temp = convertKelvin(temp)

        // this displays the temp, humidity and wind speed on the page
   
        displayCityInfo.html(cityName + "    (" + date + ")    " + "<img src=" + iconurl + ">")
        displaycTemp.html("Temperature: " + temp + "&#8457")
        displaycHumidity.html("Humidity: " + humidity + "%")
        displaycWindSpeed.html("Wind Speed: " + wind + " mph")
    
    //UV Index

    var lat = response.coord.lat;
    var lon = response.coord.lon;

    const queryURLUVInd =
      "https://api.openweathermap.org/data/2.5/uvi?&appid=" +
      weatherKey +
      "&lat=" +
      lat +
      "&lon=" +
      lon;

    $.ajax({
      url: queryURLUVInd,
      method: "GET",
    }).then(function (response) {
    //   $("#uv-index").empty();
      var uv = response.value;
      //Create the colored reponses for UV Indexes, 1-2 low (green), 3-6 moderate (yellow), 7+ severe (red)
      if (Math.floor(uv) < 3) {
        var uvEl = $("<button class='uvfair'>").text(
          "UV Index: " + response.value
        );
      } else if (Math.floor(uv) >= 3 && Math.floor(uv) < 7) {
        var uvEl = $("<button class='uvwarn'>").text(
          "UV Index: " + response.value
        );
      } else if (Math.floor(uv) >= 7) {
        var uvEl = $("<button class='uvdanger'>").text(
          "UV Index: " + response.value
        );
      }
      displaycUVIndex.html(uvEl);
    })
    })

    
}
// Retrieves the 5-day forecast for given city
function fiveDay(city) {
    console.log(city);
    var queryforcastURL =
        "https://api.openweathermap.org/data/2.5/forecast?q=" + city +
        "&appid=" + weatherKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET",
    }).then(function (response) {
        console.log(response)
        for (i = 0; i < 5; i++) {
            var date = new Date(
            response.list[(i + 1) * 8 - 1].dt * 1000
            ).toLocaleDateString();
            var iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[(i + 1) * 8 - 1].main.temp;
            var tempF = ((tempK - 273.5) * 1.8 + 32).toFixed(0);
            var humidity = response.list[(i + 1) * 8 - 1].main.humidity;
            console.log(humidity);
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html("Temp: " + tempF + "&#8457");
            $("#fHumidity" + i).html("Humidity: " + humidity + "%");
        }
    })
};

//this makes the search button fetch the weather data from desired city
searchButton.on("click", function (e) {
    e.preventDefault();
    var cityInput = $("#citySearch").val().trim()
    
    //save search to local storage
    var savedCities = [];
    savedCities.push(cityInput);
    localStorage.setItem("cityName", JSON.stringify(savedCities));

    searchWeather(cityInput)
    fiveDay(cityInput)
    pageLoad();
})

// Converts kelvin into fahrenheit
let convertKelvin = (kelvin) => {
    return parseInt(((((kelvin) - 273.15) * 1.8) + 32));
}



pageLoad();


//load stored items
function pageLoad() {
  var lastSearch = JSON.parse(localStorage.getItem("cityName"));
  var savedDiv = $(
    "<button class='btn border mt-1 text-dark bg-white rounded' style='width: 12rem; padding: 10px;'>"
  ).text(lastSearch);
  var previousSearchEl = $("<div>");
  previousSearchEl.append(savedDiv);
  $("#search-history").prepend(previousSearchEl);
  searchWeather(lastSearch);
  fiveDay(lastSearch);
}

//searches previous cities when user clicks the search history button associated with the city
$("#search-history").on("click", ".btn", function (e) {
  e.preventDefault();
  searchWeather($(this).text());
  fiveDay($(this).text())
});
