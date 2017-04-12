var main = require('../main');
var should = require('should');

describe('test/main.test.js', function () {
    console.log(111)
    console.log(main.fibonacci(10));

    if ('should equal 55 when n === 10', function () {
            main.fibonacci(10).should.equal(55);
        });
});