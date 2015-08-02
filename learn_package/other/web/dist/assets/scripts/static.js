var ToTop = (function () {
    function ToTop() {
        this.$win = $(window);
        this.$htmlbody = $('html, body');
        this.$trigger = $('#jsi-totop');
        this.showhideTrigger();
        this.bindEvents();
    }
    ToTop.prototype.bindEvents = function () {
        var _this = this;
        this.$win.on('scroll', function () {
            _this.showhideTrigger();
        });
        this.$trigger.on('click', function () {
            _this.scrollToTop();
        });
    };
    ToTop.prototype.scrollToTop = function () {
        this.$htmlbody.stop().animate({
            scrollTop: 0
        }, 500);
    };
    ToTop.prototype.showhideTrigger = function () {
        var heightHalfWindow = this.$win.height() / 2, scrollTopCurrent = this.$win.scrollTop();
        if (scrollTopCurrent > heightHalfWindow) {
            this.show();
        }
        else {
            this.hide();
        }
    };
    ToTop.prototype.show = function () {
        this.$trigger.show().stop().animate({
            opacity: 1
        });
    };
    ToTop.prototype.hide = function () {
        var _this = this;
        this.$trigger.stop().animate({
            opacity: 0
        }, function () {
            _this.$trigger.hide();
        });
    };
    return ToTop;
})();
$(function () {
    new ToTop();
});

//# sourceMappingURL=../scripts/static.js.map