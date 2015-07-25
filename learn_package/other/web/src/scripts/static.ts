/// <reference path="./vendor_def/tsd.d.ts" />

class ToTop {
  private $win: JQuery = $(window);
  private $htmlbody: JQuery = $('html, body');
  private $trigger: JQuery = $('#jsi-totop');

  constructor() {
    this.showhideTrigger();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.$win.on('scroll', () => {
      this.showhideTrigger();
    });
    this.$trigger.on('click', () => {
      this.scrollToTop();
    });
  }

  private scrollToTop(): void {
    this.$htmlbody.stop().animate({
      scrollTop: 0
    }, 500);
  }

  private showhideTrigger(): void {
    var
      heightHalfWindow = this.$win.height() / 2,
      scrollTopCurrent = this.$win.scrollTop();

    if (scrollTopCurrent > heightHalfWindow) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show(): void {
    this.$trigger.show().stop().animate({
      opacity: 1
    });
  }

  private hide(): void {
    this.$trigger.stop().animate({
      opacity: 0
    }, () => {
      this.$trigger.hide();
    });
  }
}

$(function () {
  new ToTop();
});
