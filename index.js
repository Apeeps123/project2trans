const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const kendaraanRoutes = require('./routes/kendaraan');
const transmisiRoutes = require('./routes/transmisi');

// Gunakan routes kendaraan dan transmisi
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/transmisi', transmisiRoutes);

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
