$(document).ready(function(){

  var jsiLpNews = $("#jsi-lp-news"),
      jsiLpNewsOpener = $("#jsi-lp-news-opener"),
      curHeight = jsiLpNews.height();

  // News dt&dd が3つ以上だったら
  if ( jsiLpNews.find("dd").length > 3 ) {
    // 高さを取得してreadMoreがclickされたらslideToggleされる
    jsiLpNews.css({
      height: "auto"
    });
    var autoHeight = jsiLpNews.height();
    jsiLpNews.css({
      height: curHeight
    });
    jsiLpNewsOpener.click(function(){
      jsiLpNews.animate({
        height: autoHeight
      }, 300);
      $(this).fadeOut();
    });
  // elseの場合はbtnを非表示
  } else {
    jsiLpNewsOpener.hide();
  };

  // 埋め込みyoutubeの設定
  $("#jsi-youtube-content").click(function(){
    $(this).replaceWith('<iframe src="https://www.youtube.com/embed/t_zxE3Qow-0?autoplay=1&rel=0" allowfullscreen autoplay id="jsi-youtube-iframe"></iframe>');
    // parent要素にclassを追加してiframeのサイズを調整
    $("#jsi-youtube-iframe").show().parent().addClass("pg-lp-title-movie-wrapper");
  });
  
});