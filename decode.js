// Import necessary modules
const mysql = require('mysql');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const crypto = require('crypto');

// Read the secret keys from the file
const secretKeyPath = 'secret_key.txt';
const secretKeys = fs.existsSync(secretKeyPath) ? fs.readFileSync(secretKeyPath, 'utf-8').trim().split('\n') : [];

// MySQL database connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '1234', // Replace with your MySQL password
    database: 'test_ip'
});

// Connect to MySQL database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
        // Decrypt and export data after connecting to the database
        decryptAndExportData();
    }
});

// Decrypt user details using AES decryption
function decryptData(encryptedData, secretKey) {
    try {
        // Split the encrypted data into IV and ciphertext
        const encryptedParts = encryptedData.split(':');
        const iv = Buffer.from(encryptedParts.shift(), 'base64');
        const encryptedBuffer = Buffer.from(encryptedParts.join(':'), 'base64');

        // Use the secretKey to create a decipher object
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);

        // Decrypt the data
        let decrypted = decipher.update(encryptedBuffer, 'binary', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return null;
    }
}

// Function to decrypt and export data
function decryptAndExportData() {
    // Query to fetch encrypted user details from the database
    const query = 'SELECT name, email, phone_number FROM test2 WHERE id>=14 AND id<=18';

    // Execute the query
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching encrypted data:', error);
            connection.end();
            return;
        }

        // Store decrypted data
        const decryptedData = [];

        // Iterate over each record
        results.forEach(result => {
            // Iterate over each secret key
            let decrypted = null;
            secretKeys.some(secretKey => {
                decrypted = decryptData(result.name, secretKey);
                if (decrypted) {
                    decryptedData.push({
                        name: decrypted,
                        email: decryptData(result.email, secretKey),
                        phone_number: decryptData(result.phone_number, secretKey)
                    });
                    return true; // Stop iterating over secret keys once decryption succeeds
                }
                return false; // Continue iterating over secret keys
            });
        });

        // Store decrypted data in CSV file
        const csvWriter = createObjectCsvWriter({
            path: 'decrypted_user_details.csv',
            header: [
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'phone_number', title: 'Phone Number' }
            ]
        });

        csvWriter.writeRecords(decryptedData)
            .then(() => {
                console.log('CSV file created with decrypted user details');
            })
            .catch(error => {
                console.error('Error creating CSV file:', error);
            })
            .finally(() => {
                // Close MySQL connection
                connection.end();
            });
    });
}
