var sra = sra || {};

(function () {
  var getScriptDomainName = function () {
    var script = document.getElementById('jsi-recruiting-analytics');

    if (/^\//.test(script.src)) {
      return location.protocol + '//' + location.host;
    } else {
      return script.src.match(/([a-z]+:\/\/[\w:\.]+)/)[1];
    }
  };

  var getToGeneratedAnalyticsUniqueId = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  var isExistsAnalyticsUniequeId = function(cookies) {
    for(var i = 0; i < cookies.length; i++) {
      if (/^_auid=/.test(cookies[i])) {
        return true;
      }
    }

    return false;
  };

  var setAnalyticsUniqueId = function (auid) {
    document.cookie = '_auid=' + auid;
  };

  var getAnalyticsUniqueId = function () {
    var auid;

    if (/_auid=/.test(document.cookie)) {
      auid = document.cookie.match(/_auid=([\w-]+)/)[1];
    } else {
      auid = getToGeneratedAnalyticsUniqueId();

      setAnalyticsUniqueId(auid);
    }

    return auid;
  };

  var requestForCollect = function (eventType) {
    try {
      eventType = eventType || 'pageview';

      var
        req = new XMLHttpRequest(),
        domainName = getScriptDomainName(),
        previousReferrer = encodeURIComponent(document.referrer),
        documentTitle = encodeURIComponent(document.title),
        documentUrl = encodeURIComponent(document.URL),
        auid = encodeURIComponent(getAnalyticsUniqueId()),
        url = domainName + '/analytics/collect',
        queries =
          (eventType ? 'et=' + eventType + '&' : '') +
          (previousReferrer ? 'pr=' + previousReferrer + '&' : '') +
          (auid ? 'auid=' + auid + '&' : '') +
          (documentUrl ? 'page=' + documentUrl + '&' : '') +
          (documentTitle ? 'dt=' + documentTitle : '') ;

      queries = queries.replace(/&$/, '');

      req.open('GET', url + '?' + queries);
      req.send();
    } catch(e) {
    }
  };

  requestForCollect('pageview');

  sra.apply = function () {
    requestForCollect('apply');
  };

  sra.twilioPageView = function () {
    requestForCollect("twilio.pageview");
  };
  sra.twilioClick = function () {
    requestForCollect("twilio.click");
  };
  sra.twilioCall = function () {
    requestForCollect("twilio.call");
  };
  sra.twilioCancel = function () {
    requestForCollect("twilio.cancel");
  };
})();
