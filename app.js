const express = require('express');
const fs = require('fs');
const cors = require('cors'); // ✅ NEW: To allow cross-origin requests
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // ✅ Allow all origins (for development)
app.use(express.json()); // Parse JSON request bodies

// --- Data Storage ---
const dataFilePath = 'data.json';

// --- Helper Functions ---
function readData() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Routes ---
// Welcome
app.get('/', (req, res) => {
    res.send('Welcome to the DirectRent backend!');
});

// Get all listings
app.get('/listings', (req, res) => {
    const listings = readData();
    res.json(listings);
});

// Create a new listing
app.post('/listings', (req, res) => {
    const newListing = req.body;

    // ✅ Adjusted Validation: Only require title, description, price, location
    if (!newListing.title || !newListing.description || !newListing.price || !newListing.location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const listings = readData();
    newListing.id = listings.length + 1;
    newListing.images = newListing.images || []; // ✅ Default to empty array if not provided
    listings.push(newListing);
    writeData(listings);
    res.status(201).json(newListing);
});

// Get a single listing
app.get('/listings/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const listings = readData();
    const listing = listings.find(l => l.id === id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
});

// Update a listing
app.put('/listings/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedListing = req.body;
    const listings = readData();
