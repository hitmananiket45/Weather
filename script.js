// Common API Key
const apiKey = 'cc70e32e436c40e79bb54231242410'; // Replace with your actual API key

// Handle form submission for city input
document.getElementById('weather-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
  const city = document.getElementById('city-input').value;
  addToSearchHistory(city);
  window.location.href = `weather.html?city=${encodeURIComponent(city)}`;
});

// Geolocation - Use Current Location
document.getElementById('location-btn')?.addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      window.location.href = `weather.html?lat=${lat}&lon=${lon}`;
    }, error => {
      displayError('Unable to retrieve your location. Please allow access.');
    });
  } else {
    displayError('Geolocation is not supported by this browser.');
  }
});

// Parse URL parameters to determine how to fetch weather
const params = new URLSearchParams(window.location.search);
if (params.has('city')) {
  const city = params.get('city');
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3`;
  fetchWeather(apiUrl);
} else if (params.has('lat') && params.has('lon')) {
  const lat = params.get('lat');
  const lon = params.get('lon');
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3`;
  fetchWeather(apiUrl);
}

// Fetch weather data
function fetchWeather(apiUrl) {
  toggleLoading(true); // Show loading indicator
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      toggleLoading(false); // Hide loading indicator
      if (data.error) {
        displayError(data.error.message);
      } else {
        displayWeather(data);
        displayForecast(data.forecast.forecastday);
        displaySearchHistory(); // Display search history after fetching data
      }
    })
    .catch(error => {
      toggleLoading(false); // Hide loading indicator
      console.error('Error fetching weather data:', error);
      displayError('Unable to fetch weather data. Please try again later.');
    });
}

// Display current weather
function displayWeather(data) {
  const weatherResult = document.getElementById('weather-result');
  weatherResult.innerHTML = `
    <h2>Weather in ${data.location.name}, ${data.location.country}</h2>
    <p>Temperature: ${data.current.temp_c}°C</p>
    <p>Condition: ${data.current.condition.text}</p>
    <img src="${data.current.condition.icon}" alt="${data.current.condition.text}">
    <p>Wind: ${data.current.wind_kph} kph</p>
  `;
}

// Display forecast for the next few days
function displayForecast(forecastDays) {
  const forecast = document.getElementById('forecast');
  forecast.innerHTML = '<h3>3-Day Forecast:</h3>';
  forecastDays.forEach(day => {
    forecast.innerHTML += `
      <div class="forecast-day">
        <h4>${new Date(day.date).toLocaleDateString()}</h4>
        <p>Max Temp: ${day.day.maxtemp_c}°C</p>
        <p>Min Temp: ${day.day.mintemp_c}°C</p>
        <p>Condition: ${day.day.condition.text}</p>
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
      </div>
    `;
  });
}

// Display error messages
function displayError(message) {
  const weatherResult = document.getElementById('weather-result');
  weatherResult.innerHTML = `<p>${message}</p>`;
}

// Show loading indicator
function toggleLoading(isLoading) {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.innerHTML = 'Loading...';
  
  if (isLoading) {
    document.body.appendChild(loadingIndicator);
  } else {
    const existingIndicator = document.getElementById('loading-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
  }
}

// Back button functionality
document.getElementById('back-button')?.addEventListener('click', function() {
  window.location.href = 'index.html';
});

// Search history functionality
function addToSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

function displaySearchHistory() {
  const historyList = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  historyList.innerHTML = ''; // Clear current history

  history.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => {
      window.location.href = `weather.html?city=${encodeURIComponent(city)}`;
    });
    historyList.appendChild(li);
  });

  // Show or hide clear history button based on the length of history
  document.getElementById('clear-history').style.display = history.length > 0 ? 'block' : 'none';
}

// Clear search history
document.getElementById('clear-history')?.addEventListener('click', function() {
  localStorage.removeItem('searchHistory');
  displaySearchHistory(); // Refresh the displayed history
});

// Display search history on page load
document.addEventListener('DOMContentLoaded', displaySearchHistory);
