
let request = require('request');
let promise = require('promise');
let dbManager = require('./databaseManager');
let tempManager = require('./tempManager');

/*
*   btc: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=btc_krw
*   etc: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=etc_krw
*   eth: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=eth_krw
*   xrp: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=xrp_krw
*   bch: https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=bch_krw
* */

let admin = require('firebase-admin');

let db = admin.database();

let requestCoinData = (type) => {

    return new Promise((resolved, rejected) => {
        let url = `https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=${type}_krw`;

        request(url, (err, res, body) => {
            if(err)
                rejected(err);

            try{
                let json = JSON.parse(body);

                let low = json['low'];
                let high = json['high'];

                //console.log(`high:${high}, low:${low}`);

                let diff = high - low;
                let diffPercent = 0;
                let isIncrease = diff > 0;

                let result = {
                    price: json['last'],
                    isIncrease: isIncrease,
                    diffPercent: diffPercent
                };

                resolved(result);
            } catch(err) {
                rejected(err);
            }
        });
    });
};

let requestCoinDataChain = (callback) => {
    let result = {};
    requestCoinData('btc')
        .then((data) => {
            result['coinBTC'] = data;
            return requestCoinData('etc');
        })
        .then((data) => {
            result['coinETC'] = data;
            return requestCoinData('eth');
        })
        .then((data) => {
            result['coinETH'] = data;
            return requestCoinData('xrp');
        })
        .then((data) => {
            result['coinXRP'] = data;
            return requestCoinData('bch');
        })
        .then((data) => {
            result['coinBCH'] = data;
            callback(null, result);
        })
        .catch((err) => {
            console.log(err);
            callback(err, null);
        });
};

exports.updateData = () => {

    console.log('update called');

    requestCoinDataChain((err, data) => {
        if(err){
            console.log(err);
            throw err;
        }

        let date = new Date().getTime();

        tempManager.getTemperature().then((temp) => {

            data['tempData'] = temp;
            data['timestamp'] = new Date().valueOf();
            dbManager.setData('coinData', data);
        }).catch((err) => {
            throw err;
        });
    });
};