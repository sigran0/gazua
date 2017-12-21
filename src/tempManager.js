
const webDriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/phantomjs');
const dbManager = require('./databaseManager');

const url = 'http://www.koreawqi.go.kr/wQDDRealTotalDataLayout_D.wq?MENU_GUBUN=110';
const until = webDriver.until;
const By = webDriver.By;

let crawledDate = null;
let beforeResult = null;

function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t)
    });
}

function ignoreAlert(driver) {
    // detect and accept any alert
    return new Promise((resolved, rejected) => {
        driver.switchTo()
            .alert()
            .then(function() {
                    driver.switchTo()
                        .alert()
                        .accept();
                    resolved();
                },
                function(){
                    rejected();
                });
    });
}

function click(driver, selector) {
    driver.findElement(By.css(selector)).click();
}

function crawlTemperature() {
    return new Promise((resolved, rejected) => {
        const driver = new webDriver.Builder().forBrowser('phantomjs').build();
        driver.manage().window().maximize();
        driver.get(url);
        driver
            .wait(until.elementLocated(By.css('#sel_site1 > option:nth-child(18)')), 20000)
            .then(() => {
                click(driver, '#sel_site1 > option:nth-child(18)'); //  구리 클릭
                click(driver, '#sel_site1 > option:nth-child(1)');  //  평창강 클릭 (클릭되있는거 지우기)
                click(driver, '#form_left_menu > div.page_contents > div.ta_cont > table > tbody > tr:nth-child(2) > td > div > p > a:nth-child(2)');   //  화살표 클릭

                driver
                    .wait(until.elementLocated(By.css('#div_item_list > select > option:nth-child(2)')), 20000)
                    .then(() => {
                        click(driver, '#form_left_menu > div.page_contents > div.ta_cont > table > tbody > tr:nth-child(3) > td > div > p > a:nth-child(1)');   //  화살표 클릭
                    })
                    .then(() => {
                        click(driver, '#chk_data_gubun');
                        click(driver, '#form_left_menu > div.page_contents > div.ta_cont > table > tbody > tr:nth-child(5) > td > img:nth-child(3)');   //  시작날짜

                        let date = new Date();

                        date.setDate(date.getDate() - 1);

                        let year = date.getFullYear();
                        let month = date.getMonth();
                        let day = date.getDate();

                        driver.findElement(By.css('#search_date_from')).sendKeys('text', `${year}-${month + 1}-${day}`);
                        driver.findElement(By.css('#search_date_to')).sendKeys('text', `${year}-${month + 1}-${day}`);

                        click(driver, '#form_left_menu > div.page_contents > div.ta_cont > table > tbody > tr:nth-child(5) > td > span > a > span');

                        driver.switchTo().frame(driver.findElement(By.id("ListFrame")));

                        driver
                            .wait(until.elementLocated(By.css('body > div > table > tbody > tr:nth-child(3) > td:nth-child(1)')), 20000)
                            .then(() => {
                                driver.findElement(By.css('body > div > table > tbody > tr:nth-child(3) > td:nth-child(3)'))
                                    .getText()
                                    .then(function (text) {
                                        let result = {
                                            temperature: text,
                                            timestamp: date.valueOf()
                                        };

                                        console.log(text);

                                        dbManager.setData('temperature', result);

                                        driver.close();
                                        resolved(result);
                                    });
                            })
                            .catch((err) => {
                                driver.close();
                                rejected(err);
                            });
                    })
                    .catch((err) => {
                        driver.close();
                        rejected(err);
                    });
            })
            .catch((err) => {
                driver.close();
                rejected(err);
            });
    });
};

exports.getTemperature = () => {
    return new Promise((resolved, rejected) => {

        let needCrawl = false;

        if(beforeResult === null) {
            needCrawl = true;
            crawledDate = new Date();
        }

        let currentDate = new Date();
        let timeDiff = currentDate - crawledDate;

        if(timeDiff > 43200000)     //  43200000
            needCrawl = true;

        if(needCrawl){
            console.log('need crawl temperature data');
            crawlTemperature()
                .then((data) => {
                    console.log('crawl finished');
                    beforeResult = data;
                    resolved(data);
                })
                .catch((err) => {
                    rejected(err);
                })
        } else {
            resolved(beforeResult);
        }
    });
};