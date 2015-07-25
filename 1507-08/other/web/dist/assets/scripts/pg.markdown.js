var AutoScroller = (function () {
    function AutoScroller($linkTarget) {
        this.$linkTarget = $linkTarget;
        this.DURATION = 500;
        this.MARGIN = 20;
        this.$win = $(window);
        this.$htmlbody = $('html, body');
        this.$body = $(document.body);
        this.$header = $('#jsi-header');
        this.$contentTarget = $(this.$linkTarget.attr('href')).find('> h2').eq(0);
        if (!this.$contentTarget.length) {
            return;
        }
        this.bindEvents();
    }
    AutoScroller.prototype.bindEvents = function () {
        var _this = this;
        this.$linkTarget.on('click', function (e) {
            _this.scrollToTargetElement();
            e.preventDefault();
        });
    };
    AutoScroller.prototype.scrollToTargetElement = function () {
        var scrollTopTarget = this.getComputedScrollTop();
        this.$htmlbody.stop().animate({
            scrollTop: scrollTopTarget
        }, this.DURATION);
    };
    AutoScroller.prototype.getComputedScrollTop = function () {
        var scrollBottom, heightHeader = this.$header.outerHeight(), scrollTopResponse = this.$contentTarget.offset().top;
        scrollTopResponse -= heightHeader + this.MARGIN;
        scrollBottom = scrollTopResponse + this.$win.height();
        if (scrollBottom > this.$body.height()) {
            scrollTopResponse = this.$body.height() - this.$win.height();
        }
        return scrollTopResponse;
    };
    return AutoScroller;
})();
$(function () {
    $('.jsc-autoscroller').each(function () {
        new AutoScroller($(this));
    });
});

//# sourceMappingURL=../scripts/pg.markdown.js.map