document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ipAddress = urlParams.get('ip');

    fetch(`https://ipapi.co/${ipAddress}/json/`)
        .then(response => response.json())
        .then(locationData => {
            const detailsContainer = document.getElementById('location-details');
            const detailsArray = [
                `IP Address: ${locationData.ip}`,
                `IP Version: ${locationData.version}`,
                `City: ${locationData.city}`,
                `Region: ${locationData.region}`,
                `Country: ${locationData.country_name} (${locationData.country})`,
                `Country Capital: ${locationData.country_capital}`,
                `Latitude: ${locationData.latitude}`,
                `Longitude: ${locationData.longitude}`,
                `Timezone: ${locationData.timezone}`,
                `Organization (ISP): ${locationData.org}`,
                `ASN: ${locationData.asn}`,
                `Hostname: ${getUserHostname()}`
            ];

            detailsContainer.innerHTML = ''; // Clear the initial 'Loading...' text

            // Display details one by one in succession
            detailsArray.forEach((detail, index) => {
                const detailBox = document.createElement('div');
                detailBox.className = 'detail-box';
                detailBox.innerText = detail;

                // Set a delay for each detail
                setTimeout(() => {
                    detailsContainer.appendChild(detailBox);
                }, index * 1000); // Adjust the delay as needed
            });

            // Store data in MySQL
            const response = storeUserData(locationData);
            console.log('Response from storeUserData:', response);
            initMap(locationData.latitude, locationData.longitude);
        })
        .catch(error => {
            console.error('Error fetching location details:', error);
            document.getElementById('location-details').innerText = 'Error fetching location details';
        });
});

function storeUserData(locationData) {
    const {
        ip,
        version,
        city,
        region,
        country_name,
        country,
        country_capital,
        latitude,
        longitude,
        timezone,
        org,
        asn,
    } = locationData;

    const hostname = getUserHostname();

    // Send data to Node.js server
    try {
        const response =  fetch('https://b60d-2409-40d0-100b-b1c2-f461-e3df-fd04-329f.ngrok-free.app/storeUserData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ip_address: ip,
                ip_version: version,
                city,
                region,
                country: country_name,
                country_capital,
                latitude,
                longitude,
                timezone,
                isp: org,
                asn,
                hostname,
            }),
        });

        return response;
       
    } catch (error) {
        console.error('Error storing user data:', error);
        return null;
    }
}

// Function to dynamically get the user's hostname
function getUserHostname() {
    return window.location.hostname;
  }


function initMap(lat, lng) {
    const center = { lat: parseFloat(lat), lng: parseFloat(lng) };

  

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: center,
    });

    const marker = new google.maps.Marker({
        position: center,
        map: map
    });
}