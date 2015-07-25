/// <reference path="./vendor_def/tsd.d.ts" />

class AutoScroller {
  private DURATION: number = 500;
  private MARGIN: number = 20;

  private $win: JQuery = $(window);
  private $htmlbody: JQuery = $('html, body');
  private $body: JQuery = $(document.body);
  private $header: JQuery = $('#jsi-header');
  private $contentTarget: JQuery;

  constructor(private $linkTarget: JQuery) {
    this.$contentTarget = $(this.$linkTarget.attr('href')).find('> h2').eq(0);

    if (!this.$contentTarget.length) {
      return;
    }

    this.bindEvents();
  }

  private bindEvents(): void {
    this.$linkTarget.on('click', (e) => {
      this.scrollToTargetElement();
      e.preventDefault();
    });
  }

  private scrollToTargetElement(): void {
    var
      scrollTopTarget: number = this.getComputedScrollTop();

    this.$htmlbody.stop().animate({
      scrollTop: scrollTopTarget
    }, this.DURATION);
  }

  private getComputedScrollTop(): number {
    var
      scrollBottom: number,
      heightHeader: number = this.$header.outerHeight(),
      scrollTopResponse: number = this.$contentTarget.offset().top;

    scrollTopResponse -= heightHeader + this.MARGIN;
    scrollBottom = scrollTopResponse + this.$win.height();

    if (scrollBottom > this.$body.height()) {
      scrollTopResponse = this.$body.height() - this.$win.height();
    }

    return scrollTopResponse;
  }
}

$(function () {
  $('.jsc-autoscroller').each(function () {
    new AutoScroller($(this));
  });
});