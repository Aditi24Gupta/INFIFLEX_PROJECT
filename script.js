let name, email, phone;


document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded successfully');

    // Fetching IP address and displaying it
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const ipAddress = data.ip;
            console.log('IP Address:', ipAddress);
            document.getElementById('ip-address').innerText = `Your IP Address: ${ipAddress}`;

            // Storing IP Address in localStorage
            localStorage.setItem('ipAddress', ipAddress);
        })
        .catch(error => {
            console.error('Error fetching IP address:', error);
            document.getElementById('ip-address').innerText = 'Error fetching IP address';
        });

    // Add event listener for form submission
    document.getElementById('user-details-form').addEventListener('submit', submitUserDetails);

    // Add an event listener to the IP Details button
    document.getElementById('ip-details-button').addEventListener('click', redirectToDetails);
});

function submitUserDetails(event) {
    event.preventDefault(); // Prevent form submission

    // Get user input values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Validate user input
    if (name.trim() === '' || email.trim() === '' || phone.trim() === '') {
        alert('Please fill out all fields');
        return null; // Return null if any field is empty
    }



    // Send user details to server
    fetch('https://b60d-2409-40d0-100b-b1c2-f461-e3df-fd04-329f.ngrok-free.app/submitUserDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            email: email,
            phone: phone
        })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        // Show IP details button
        document.getElementById('ip-details-button').style.display = 'block';

        // Add the "process" class to trigger the loading animation
        const submitButton = document.getElementById('submit-details');
        submitButton.classList.add('process');
        submitButton.innerText = 'Processing...';

        // Simulate processing delay (5 seconds in this example)
        setTimeout(() => {
            // Remove the "process" class and add the "submitted" class after processing is done
            submitButton.classList.remove('process');
            submitButton.classList.add('submitted');
            submitButton.innerHTML = `
                <span class="tick">&#10004;</span>
                Submitted
            `;
        }, 5000); // Adjust the delay as needed
    })
    .catch(error => console.error('Error submitting user details:', error));
}



function redirectToDetails() {
    const ipAddress = localStorage.getItem('ipAddress');

    // Redirect to details page with IP parameter
    window.location.href = `details.html?ip=${ipAddress}`;
}
