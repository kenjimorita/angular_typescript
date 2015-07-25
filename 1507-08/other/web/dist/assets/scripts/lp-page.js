$(document).ready(function () {
    var jsiLpNews = $("#jsi-lp-news"), jsiLpNewsOpener = $("#jsi-lp-news-opener"), curHeight = jsiLpNews.height();
    if (jsiLpNews.find("dd").length > 3) {
        jsiLpNews.css({
            height: "auto"
        });
        var autoHeight = jsiLpNews.height();
        jsiLpNews.css({
            height: curHeight
        });
        jsiLpNewsOpener.click(function () {
            jsiLpNews.animate({
                height: autoHeight
            }, 300);
            $(this).fadeOut();
        });
    }
    else {
        jsiLpNewsOpener.hide();
    }
    ;
    $("#jsi-youtube-content").click(function () {
        $(this).replaceWith('<iframe src="https://www.youtube.com/embed/t_zxE3Qow-0?autoplay=1&rel=0" allowfullscreen autoplay id="jsi-youtube-iframe"></iframe>');
        $("#jsi-youtube-iframe").show().parent().addClass("pg-lp-title-movie-wrapper");
    });
});

//# sourceMappingURL=../scripts/lp-page.js.map