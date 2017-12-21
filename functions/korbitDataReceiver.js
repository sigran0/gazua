
let request = require('request');

/*
*   btc: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=btc_krw
*   etc: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=etc_krw
*   eth: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=eth_krw
*   xrp: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=xrp_krw
*   bch: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=bch_krw
* */

let admin = require('firebase-admin');

let db = admin.database();

exports.hello = (callback) => {

    db.ref('good').set({
        hello: 'world'
    });
};

exports.requestBTCdetail = (callback) => {
    let url = 'https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=btc_krw';

    request(url, (err, res, body) => {

        if(err){
            console.log('fucking' + err);
            callback(err, null);
            throw err;
        }


        let json = JSON.parse(body);

        let result = {
            timestamp: json['timestamp'],
            low: json['low'],
            high: json['high']
        };

        callback(null, result);
    });
};
