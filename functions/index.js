const functions = require('firebase-functions');
const receiver = require('./korbitDataReceiver');
const cors = require('cors')({origin: true});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https
    .onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.requestETCdata = functions.https
    .onRequest((req, res) => {

    if(req.method !== 'GET')
        res.status(403).send('Forbidden!');

    cors(req, res, () => {
        receiver.requestBTCdetail((err, data) => {

            if(err)
                res.json({
                    result: "FAILED",
                    code: 400,
                    data: null
                });

            res.json({
                result: "SUCCESS",
                code: 200,
                data: data
            });
        });
    });
});
