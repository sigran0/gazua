const express = require('express');
const router = express.Router();

const firebaseMiddleware = require('express-firebase-middleware');
const dataReceiver = require('./thirdPartyApiReceiver');
const firebase = require('firebase');
const dbManager = require('./databaseManager');

const admin = require('./firebase-admin');


router.use((req, res, next) => {
    next();
});

//router.use('/api', firebaseMiddleware.auth);

router.use('/api/get_lastest_data', (req, res) => {

    dbManager
        .getLastestOneData('coinData')
        .then((data) => {
            res.json({
                success: true,
                code: 200,
                error: null,
                data: data
            })
        })
        .catch((err) => {
            res.json({
                success: false,
                code: 400,
                error: err.message,
                data: null
            });
    });
});

router.get('/', (req, res) => {

});

router.get('/api/hello', (req, res) => {
    res.json({
        message: `You're logged in as ${res.locals.user.email} with Firebase UID: ${res.locals.user.uid}`
    });
});

module.exports = router;