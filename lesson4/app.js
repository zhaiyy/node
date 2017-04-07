var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');

var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
    .end(function (err, res) {
        if (err) {
            return console.error(err)
        }
        ;
        var topicUrls = [];
        var $ = cheerio.load(res.text);

        $('#topic_list .topic_title').each(function (id, ele) {
            var $ele = $(ele);
            var href = url.resolve(cnodeUrl, $ele.attr('href'));
            topicUrls.push(href)
        });


        async.mapLimit(topicUrls, 5, function (topicUrl, callback) {
            superagent.get(topicUrl)
                .retry(2)
                .end(function (err, res) {
                    console.log('fetch ' + topicUrl + ' successful');
                    var $ = cheerio.load(res.text);
                    var data = {
                        title: $('.topic_full_title').text().trim(),
                        href: topicUrl,
                        commend1: $('.reply_content').eq(0).text().trim(),
                        author1: $('.reply_author').eq(0).text().trim(),
                        authorurl: $('.reply_author').eq(0).attr('href')
                    };
                    if (data.authorurl != undefined) {
                        var authorurl = url.resolve(cnodeUrl, data.authorurl);
                    } else {
                        var authorurl = '';
                    }
                    superagent.get(authorurl)
                        .end(function (err, res) {
                            if (res) {
                                var $ = cheerio.load(res.text);
                                data.score1 = $('.board').text().trim();
                            } else {
                                data.score1 = '';
                            }
                            console.log('fetch ' + data.author1 + ' score successful');

                            callback(null, data);

                        });
                });
        }, function (err, result) {
            console.log('final:');
            console.log(result)
        });

    });