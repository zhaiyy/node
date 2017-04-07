var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');

var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

var ep = new eventproxy();

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

    ep.after('topic_html', topicUrls.length, function (topics) {
        topics.map(function (topicPair) {
            var topUrl = topicPair[0];
            var topHtml = topicPair[1];
            var $ = cheerio.load(topHtml);
            var data = {
                title: $('.topic_full_title').text().trim(),
                href: topUrl,
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
                    ep.emit('topic_author', data);

                });
        });
        ep.after('topic_author', topicUrls.length, function (data) {
            console.log('final:');
            console.log(data);
            console.log(data.length);
        });
    });


    topicUrls.forEach(function (url) {
        superagent.get(url)
            .retry(2)
            .end(function (err, res) {
                console.log('fetch ' + url + 'successful');
                ep.emit('topic_html', [url, res.text])
            });
    })
});