var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');

var app = express();
app.get('/', function (req, res, next) {
    superagent.get('http://pub.alimama.com/')
        .end(function (err, data) {
            if(err) return next(err);
            var $ = cheerio.load(data.text);
            var items = [];
            console.log(data)
            $('.footer .link a').each(function (id,ele) {
                var $ele = $(ele)
                items.push({
                    title: $ele.text(),
                    href: $ele.attr('href'),
                });
            });
            res.send(items)
        });
});

app.listen(3000, function () {
    console.log('app is listing at port 3000');
});