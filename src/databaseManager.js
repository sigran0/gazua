let admin = require('firebase-admin');

let db = admin.database();

exports.setData = (keyword, data) => {
    db.ref(keyword).push(data);
};

exports.getLastestOneData = (keyword) => {
    return new Promise((resolved, rejected) => {
        db.ref(keyword).limitToLast(1).once('value').then((snapshot) => {

            if(snapshot === null || snapshot === undefined)
                reject();

            let data = snapshot.val();
            let key = Object.keys(data)[0];

            resolved(data[key]);
        });
    });
};