// --- Configuration ---
// !!! IMPORTANT: Replace this URL with the actual URL of your deployed Cloudflare Worker !!!
const WORKER_API_URL = 'https://otibeguni-poi-api.dry-glitter-f649.workers.dev';
// Example: const WORKER_API_URL = 'https://baserow-poi-api.my-cloudflare.workers.dev';

// --- Initialize Leaflet Map ---
// Center the map initially (e.g., on Bangladesh)
const initialCenter = [23.6850, 90.3563];
const initialZoom = 7;

// Create the map instance
const map = L.map('map').setView(initialCenter, initialZoom);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
}).addTo(map);

// --- Fetch Data and Add Markers ---
async function loadMarkers() {
    console.log(`Fetching data from: ${WORKER_API_URL}`);
    try {
        const response = await fetch(WORKER_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const pointsOfInterest = await response.json();
        console.log(`Received ${pointsOfInterest.length} points.`);

        // Create a layer group to hold markers
        const markerGroup = L.layerGroup();

        pointsOfInterest.forEach(point => {
            // Check if latitude and longitude are valid numbers
            if (typeof point.latitude === 'number' && typeof point.longitude === 'number') {
                const marker = L.marker([point.latitude, point.longitude]);

                // Add a simple popup showing the title (if available)
                if (point.title) {
                    marker.bindPopup(`<b>${point.title}</b>`);
                }
                // Add marker to the group
                markerGroup.addLayer(marker);
            } else {
                console.warn(`Skipping point with invalid coordinates: ${point.title || `ID ${point.id}`}`);
            }
        });

        // Add the group of markers to the map
        markerGroup.addTo(map);
        console.log("Markers added to map.");

        // Optional: Adjust map bounds to fit all markers
        if (markerGroup.getLayers().length > 0) {
             map.fitBounds(markerGroup.getBounds().pad(0.1)); // pad adds some margin
        }


    } catch (error) {
        console.error('Error fetching or processing data:', error);
        // Optionally display an error message to the user on the page
        alert(`Failed to load points of interest. Please check the console for details. Error: ${error.message}`);
    }
}

// --- Run ---
// Call the function to load markers when the script runs
loadMarkers();
