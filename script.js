// const formEl = document.querySelector('form');
// const ipInputEl = document.getElementById('ip-input');
// const ipEl = document.getElementById('ip-info');
// const locationEl = document.getElementById('location-info');
// const timezoneEl = document.getElementById('timezone-info');
// const ispEl = document.getElementById('isp-info');

// const modal = document.getElementById('modal');
// const errorMsgEl = document.getElementById('error-message');
// const closeBtn = document.getElementById('close-btn');

// const map = L.map('map').setView([0, 0], 13);
// const tileUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2V2ZXRpaDg2MSIsImEiOiJja2h4MzFxaG8wOW5pMzBsdGZ1NXFoeHh5In0.hw5mLyF4KWalDgcxAWrmuw';

// L.tileLayer(tileUrl, {
//     maxZoom: 18,
//     attribution: false,
//     id: 'mapbox/streets-v11',
//     tileSize: 512,
//     zoomOffset: -1
// }).addTo(map);

// const locationIcon = L.icon({
//     iconUrl: 'images/icon-location.svg',
//     iconSize: [35, 35],
//     iconAnchor: [15, 15]
// });

// const marker = L.marker([0, 0], {icon: locationIcon}).addTo(map);

// formEl.onsubmit = (e) => {
//     e.preventDefault();
    
//     fetch(`https://ipapi.co/${ipInputEl.value}/json/`)
//         .then(res => res.json())
//         .then(data => renderResults(data))
//         .catch(error => displayError(error));
    
//     e.target.reset();
// }

// fetch('https://ipapi.co/json/')
//     .then(res => res.json())
//     .then(data => renderResults(data))
//     .catch(error => displayError(error));

// function renderResults(data) {
//     if (data.error) {
//         throw(`${data.reason}`);
//     }
//     ipEl.textContent = data.ip;
//     locationEl.textContent = `${data.city}, ${data.region}, ${data.country_name}`;
//     if (data.utc_offset !== null) {
//         timezoneEl.textContent = 'UTC: ' + data.utc_offset.slice(0, 3) + ':' + data.utc_offset.slice(3);
//     }
//     else {
//         timezoneEl.textContent = data.timezone;
//     }
//     ispEl.textContent = data.org;
//     map.setView([data.latitude, data.longitude], 13);
//     marker.setLatLng([data.latitude, data.longitude]);
//     marker.bindPopup(`<b>${data.ip}</b>`).openPopup();
// }

// function displayError(e) {
//     errorMsgEl.textContent = e;
//     modal.showModal();
// }

// closeBtn.onclick = () => {
//     modal.close();
// }
const formEl = document.querySelector('form');
const ipInputEl = document.getElementById('ip-input');
const ipEl = document.getElementById('ip-info');
const locationEl = document.getElementById('location-info');
const timezoneEl = document.getElementById('timezone-info');
const ispEl = document.getElementById('isp-info');
const latEl = document.getElementById('latitude-info');
const lonEl = document.getElementById('longitude-info');

const modal = document.getElementById('modal');
const errorMsgEl = document.getElementById('error-message');
const closeBtn = document.getElementById('close-btn');

const map = L.map('map').setView([0, 0], 2);
const tileUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2V2ZXRpaDg2MSIsImEiOiJja2h4MzFxaG8wOW5pMzBsdGZ1NXFoeHh5In0.hw5mLyF4KWalDgcxAWrmuw';

L.tileLayer(tileUrl, {
    maxZoom: 18,
    attribution: false,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

const locationIcon = L.icon({
    iconUrl: 'images/icon-location.svg',
    iconSize: [35, 35],
    iconAnchor: [15, 15]
});

const marker = L.marker([0, 0], { icon: locationIcon }).addTo(map);

// Fetch IP data based on form submission
formEl.onsubmit = (e) => {
    e.preventDefault();
    
    const ipOrDomain = ipInputEl.value.trim();
    if (!ipOrDomain) {
        displayError('Input cannot be empty.');
        return;
    }
    
    fetchIPData(ipOrDomain);
    e.target.reset();
}

// Function to fetch IP data from the API
function fetchIPData(query) {
    fetch(`https://ipapi.co/${query}/json/`)
        .then(res => res.json())
        .then(data => renderResults(data))
        .catch(error => displayError('Failed to fetch IP data. Please try again.'));
}

// Function to fetch IP data for user's IP or location-based IP data
function fetchUserLocation() {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => renderResults(data))
        .catch(error => displayError('Could not retrieve your location.'));
}

// Render IP data and map location
function renderResults(data) {
    if (data.error) {
        displayError(data.reason || 'An error occurred.');
        return;
    }
    
    ipEl.textContent = data.ip;
    locationEl.textContent = `${data.city}, ${data.region}, ${data.country_name}`;
    timezoneEl.textContent = data.utc_offset ? `UTC: ${data.utc_offset.slice(0, 3)}:${data.utc_offset.slice(3)}` : data.timezone;
    ispEl.textContent = data.org;
    latEl.textContent = data.latitude;  // Display latitude
    lonEl.textContent = data.longitude; // Display longitude

    const lat = data.latitude;
    const lon = data.longitude;
    
    map.setView([lat, lon], 13);
    marker.setLatLng([lat, lon]);
    marker.bindPopup(`<b>${data.ip}</b>`).openPopup();
}

// Display error in a modal
function displayError(message) {
    errorMsgEl.textContent = message;
    modal.showModal();
}

closeBtn.onclick = () => modal.close();

// Geolocation integration to detect user's live location
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        
        // Update map view based on live location
        map.setView([latitude, longitude], 13);
        marker.setLatLng([latitude, longitude]);
        
        // Reverse geocode to get IP data based on coordinates
        fetch(`https://ipapi.co/${latitude},${longitude}/json/`)
            .then(res => res.json())
            .then(data => renderResults(data))
            .catch(() => fetchUserLocation()); // Fallback to IP-based location if geolocation IP lookup fails
    }, () => fetchUserLocation()); // Fallback if permission is denied or location is unavailable
} else {
    fetchUserLocation(); // Fallback if geolocation is not supported
}
