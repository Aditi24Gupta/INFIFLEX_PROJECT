// Import necessary modules
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const CryptoJS = require('crypto-js');

// Function to generate a unique secret key
function generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
}

// Create or read the secret key from the file
let secretKeys = [];

if (fs.existsSync('secret_key.txt')) {
    secretKeys = fs.readFileSync('secret_key.txt', 'utf-8').split('\n').map(key => key.trim());
} else {
    secretKeys.push(generateSecretKey());
    fs.writeFileSync('secret_key.txt', secretKeys[0] + '\n', 'utf-8');
}

console.log('Secret Keys:', secretKeys);

// Create express app
const app = express();
const port = 8080;
const path = require('path');

// Serve static files from the same directory as im keeping all my files in the same folder
app.use(express.static(path.join(__dirname)));

// Serve the root path with home.html theres no need to write home.html in the address bar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'test_ip'
});

// Connect to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Global variables for storing user details
let name, email, phone;

// Endpoint to store user details
app.post('/submitUserDetails', (req, res) => {
    const userDetails = req.body;

    // Extract user details from request body
    name = userDetails.name;
    email = userDetails.email;
    phone = userDetails.phone;

    // Validate user details
    if (!name || !email || !phone) {
        res.status(400).send('Please provide all user details');
        return;
    }

    

    // Generate a new secret key for this record
    const newSecretKey = generateSecretKey();
    secretKeys.push(newSecretKey);
    fs.appendFileSync('secret_key.txt', newSecretKey + '\n', 'utf-8');

    console.log('New Secret Key:', newSecretKey);

    // Encrypt user details
    const encryptedName = encrypt(name, newSecretKey);
    const encryptedEmail = encrypt(email, newSecretKey);
    const encryptedPhone = encrypt(phone, newSecretKey);

    // Store user details in global variables
    name = encryptedName;
    email = encryptedEmail;
    phone = encryptedPhone;

    res.status(200).send('User details stored successfully');
});

// Endpoint to store user and IP details together
app.post('/storeUserData', (req, res) => {
    const userData = req.body;

    // Combine user details from global variables with IP details
    const userDetailsWithIP = {
        name: name,
        email: email,
        phone: phone,
        ip_address: userData.ip_address,
        ip_version: userData.ip_version,
        city: userData.city,
        region: userData.region,
        country: userData.country,
        country_capital: userData.country_capital,
        latitude: userData.latitude,
        longitude: userData.longitude,
        timezone: userData.timezone,
        isp: userData.isp,
        asn: userData.asn,
        hostname: userData.hostname
    };

    // Insert combined user and IP details into MySQL table
    connection.query(
        'INSERT INTO test2 (name, email, phone_number, ip_address, ip_version, city, region, country, country_capital, latitude, longitude, timezone, isp, asn, hostname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        Object.values(userDetailsWithIP),
        (error, results) => {
            if (error) {
                console.error('Error storing user and IP details:', error);
                res.status(500).send('Error storing user and IP details');
            } else {
                console.log('User and IP details stored successfully');
                res.status(200).send('User and IP details stored successfully');
            }
        }
    );
});

// AES encryption function
function encrypt(data, key) {
    const iv = crypto.randomBytes(16); // Generate random IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
