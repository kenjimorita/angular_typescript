var app;
(function (app) {
    var util;
    (function (util) {
        var strings;
        (function (strings) {
            function trimLeft(str) {
                return str.replace(/^¥s+/, '');
            }
            strings.trimLeft = trimLeft;
            function trimRight(str) {
                return str.replace(/^¥s+/, '');
            }
            strings.trimRight = trimRight;
        })(strings = util.strings || (util.strings = {}));
    })(util = app.util || (app.util = {}));
})(app || (app = {}));
