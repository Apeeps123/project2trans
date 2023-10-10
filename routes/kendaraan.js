const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const connection = require('../config/db');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Jenis file tidak diizinkan'), false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET all kendaraan
router.get('/', (req, res) => {
    connection.query('SELECT * FROM kendaraan', (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Kendaraan',
                data: rows,
            });
        }
    });
});

// POST a new kendaraan
router.post('/store', upload.single("gambar_kendaraan"), [
    // Validation
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }

    const { no_pol, nama_kendaraan, id_transmisi } = req.body;
    const gambar_kendaraan = req.file ? req.file.filename : null;

    const kendaraanBaru = {
        no_pol,
        nama_kendaraan,
        id_transmisi,
        gambar_kendaraan,
    };

    connection.query('INSERT INTO kendaraan SET ?', kendaraanBaru, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: kendaraanBaru,
            });
        }
    });
});

// GET a kendaraan by ID (no_pol)
router.get('/:no_pol', (req, res) => {
    const { no_pol } = req.params;
    connection.query('SELECT * FROM kendaraan WHERE no_pol = ?', [no_pol], (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }

        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Kendaraan',
                data: rows[0],
            });
        }
    });
});

// PUT/update a kendaraan by ID (no_pol)
router.put('/update/:no_pol', upload.single("gambar_kendaraan"), [
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }

    const { no_pol } = req.params;
    const { nama_kendaraan, id_transmisi } = req.body;
    const gambar_kendaraan = req.file ? req.file.filename : null;

    connection.query('SELECT * FROM kendaraan WHERE no_pol = ?', [no_pol], (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        }

        const namaFileLama = rows[0].gambar_kendaraan;

        // Hapus file lama jika ada
        if (namaFileLama && gambar_kendaraan) {
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        const kendaraanTerupdate = {
            no_pol,
            nama_kendaraan,
            id_transmisi,
            gambar_kendaraan,
        };

        connection.query('UPDATE kendaraan SET ? WHERE no_pol = ?', [kendaraanTerupdate, no_pol], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Update Success..!',
                });
            }
        });
    });
});

// DELETE a kendaraan by ID (no_pol)
router.delete('/delete/:no_pol', (req, res) => {
    const { no_pol } = req.params;

    connection.query('SELECT * FROM kendaraan WHERE no_pol = ?', [no_pol], (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        }

        const namaFileLama = rows[0].gambar_kendaraan;

        // Hapus file lama jika ada
        if (namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        connection.query('DELETE FROM kendaraan WHERE no_pol = ?', [no_pol], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Data has been deleted!',
                });
            }
        });
    });
});

module.exports = router;
