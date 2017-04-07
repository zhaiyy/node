var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');

var app = express();
app.get('/', function (req, res, next) {
    superagent.get('http://cnodejs.org')
        .end(function (err, data) {
            if(err) return next(err);
            var $ = cheerio.load(data.text);
            var items = [];
            console.log(data)
            $('#topic_list .topic_title').each(function (id,ele) {
                var $ele = $(ele);
                items.push({
                    title: $ele.attr('title'),
                    href: $ele.attr('href'),
                    author: $('#topic_list .user_avatar').eq(id).find('img').attr('title')
                });
            });
           res.send(items)
        });
});

app.listen(3000, function () {
    console.log('app is listing at port 3000');
});