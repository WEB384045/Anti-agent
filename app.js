const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Data Storage (using a JSON file for simplicity) ---
const dataFilePath = 'data.json';

// Helper function to read data from the file
function readData() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
        return [];
    }
}

// Helper function to write data to the file
function writeData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Routes ---

//  * GET / - Welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the DirectRent backend!');
});

//  * GET /listings - Get all listings
app.get('/listings', (req, res) => {
    const listings = readData();
    res.json(listings);
});

//  * POST /listings - Create a new listing
app.post('/listings', (req, res) => {
    const newListing = req.body;

    // Basic validation (you should add more robust validation)
    if (!newListing.title || !newListing.description || !newListing.imageUrl) {
        return res.status(400).json({ error: 'Title, description, and imageUrl are required' });
    }

    const listings = readData();
    newListing.id = listings.length + 1; // Simple ID assignment (use a better method in production)
    listings.push(newListing);
    writeData(listings);
    res.status(201).json(newListing); // 201 Created
});

//  * GET /listings/:id - Get a single listing by ID
app.get('/listings/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const listings = readData();
    const listing = listings.find(l => l.id === id);

    if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(listing);
});

//  * PUT /listings/:id - Update a listing
app.put('/listings/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedListing = req.body;
    const listings = readData();

    const index = listings.findIndex(l => l.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing (you might want to selectively update fields)
    listings[index] = { ...listings[index], ...updatedListing, id: id }; // Keep the ID
    writeData(listings);
    res.json(listings[index]);
});

//  * DELETE /listings/:id - Delete a listing
app.delete('/listings/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const listings = readData();
    const index = listings.findIndex(l => l.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    listings.splice(index, 1);
    writeData(listings);
    res.status(204).send(); // 204 No Content
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server is running on https://anti-agent-directrent-api.onrender.com`);
});
