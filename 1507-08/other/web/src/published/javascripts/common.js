$(window).on('load', function () {
  $('.jsc-imgcentering')
    .imgcentering()
    .find('img')
    .css('opacity', 1);
});

$.ajaxSetup({
  global: true
});


/*
 * When Non-Get Request is successful, then notifies Google Tag Manager via dataLayer object
 */
$(document).ajaxSuccess(function(e, xhr, settings){

  if(xhr.status == 200 && settings.type != 'GET'){
    if(typeof dataLayer == 'undefined' || !dataLayer){
      dataLayer = [];
    }
    dataLayer.push({
      'event': 'stSuccessfulAjaxCall',
      'stSuccessfulAjaxCallMethod': settings.type,
      'stSuccessfulAjaxCallUrl': settings.url
    });
  }
});


// pg.joblist.jsに書こうとおもったけど、なぜかモバイルはcommon.jsだけなので、ここに書くしかない
(function(){
  $('.pg-list-cassette.jsc-joblist-cassette').each(function(){
    var that = this;
    var corporate_id = $(this).data('corporate_id');
    // WARN: ループ内に書いてるので、外に出して複数処理をできるAPIを用意したほうがいい
    $.ajax({
      url : '/api/twilio/status/corporateId/'+corporate_id
    })
    .done(function( data ){
      if( data.isTwilioOpen ){
        $(that).find('.jsc-isTwilioOpen').show();
        $(that).find('.jsc-isNotTwilioOpen').hide();
      }else{
        $(that).find('.jsc-isTwilioOpen').hide();
        $(that).find('.jsc-isNotTwilioOpen').show();
      }
    });
  });
})();