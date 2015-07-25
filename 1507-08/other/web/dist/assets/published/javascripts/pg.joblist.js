var SBATSJOB = window.SBATSJOB || {};

SBATSJOB.ContinueManager = function ($joblist) {
  this.$joblist = $joblist;
  this.$jobCassettes = this.$joblist.find('.jsc-joblist-cassette');

  this.init();
};
SBATSJOB.ContinueManager.prototype = {
  init: function () {
    this.judgeShowHide();
  },
  judgeShowHide: function () {
    this.$jobCassettes.each($.proxy(function (i) {
      var
        $jobCassetteBody = this.$jobCassettes.eq(i).find('.jsc-joblist-cassette-body'),
        $jobCassetteContinue = this.$jobCassettes.eq(i).find('.jsc-joblist-cassette-continue'),

        scrollHeightBody = $jobCassetteBody[0].scrollHeight,
        // 1.6 = line-height
        height3Lines = (parseInt($jobCassetteBody.css('font-size'), 10) * 3) * 1.6;

      if (scrollHeightBody > height3Lines) {
        $jobCassetteContinue.css('display', 'inline-block');
      }
    }, this));
  }
};

$(function () {
  new SBATSJOB.ContinueManager($('#jsi-joblist'));
});
