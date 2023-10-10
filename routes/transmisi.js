const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const connection = require('../config/db');

// GET all transmisi
router.get('/', (req, res) => {
    connection.query('SELECT * FROM transmisi', (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Transmisi',
                data: rows,
            });
        }
    });
});

// GET a transmisi by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM transmisi WHERE id_transmisi = ?', [id], (err, rows) => {
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
                message: 'Data Transmisi',
                data: rows[0],
            });
        }
    });
});

// POST a new transmisi
router.post('/store', [
    // Validation
    body('nama_transmisi').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }

    const { nama_transmisi } = req.body;

    const transmisiBaru = {
        nama_transmisi,
    };

    connection.query('INSERT INTO transmisi SET ?', transmisiBaru, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: transmisiBaru,
            });
        }
    });
});

// PUT/update a transmisi by ID
router.put('/update/:id', [
    body('nama_transmisi').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }

    const { id } = req.params;
    const { nama_transmisi } = req.body;

    connection.query('SELECT * FROM transmisi WHERE id_transmisi = ?', [id], (err, rows) => {
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

        const transmisiTerupdate = {
            nama_transmisi,
        };

        connection.query('UPDATE transmisi SET ? WHERE id_transmisi = ?', [transmisiTerupdate, id], (err, result) => {
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

// DELETE a transmisi by ID
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;

    connection.query('SELECT * FROM transmisi WHERE id_transmisi = ?', [id], (err, rows) => {
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

        connection.query('DELETE FROM transmisi WHERE id_transmisi = ?', [id], (err, result) => {
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
