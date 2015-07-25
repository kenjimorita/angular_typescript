var SBATSJOBSP = window.SBATSJOBSP || {};

SBATSJOBSP.ApplyManager = function () {
  this.$htmlbody = $('html, body');
  this.$wrapper = $('#jsi-wrapper');
  this.$base = $('#jsi-apply');
  this.$form = this.$base.find('form');
  this.$inputs = this.$base.find('input[type=text], select, textarea');
  this.$inputsValidate = this.$inputs.filter('[data-required], [data-other-required], [data-phone], [data-email]');
  this.$privacyCheck = $('#agree');
  this.$trigger = $('#jsi-apply-trigger');
  this.$toConfirm = this.$base.find('.jsc-apply-toconfirm');
  this.$confirm = $('#jsi-confirm');
  this.$toBasic = this.$confirm.find('.jsc-apply-tobasic');
  this.$submit = this.$confirm.find('.jsc-apply-submit');
  this.$confirmFullName = this.$confirm.find('.jsc-apply-confirm-fullname');
  this.$confirmFullNameKana = this.$confirm.find('.jsc-apply-confirm-fullnamekana');
  this.$confirmPhone = this.$confirm.find('.jsc-apply-confirm-phone');
  this.$confirmEmail = this.$confirm.find('.jsc-apply-confirm-email');
  this.$confirmLastOrganization = this.$confirm.find('.jsc-apply-confirm-lastorganization');
  this.$confirmLastTitle = this.$confirm.find('.jsc-apply-confirm-lasttitle');
  this.$confirmBirthDate = this.$confirm.find('.jsc-apply-confirm-birthdate');
  this.$confirmMessage = this.$confirm.find('.jsc-apply-confirm-message');
  this.$confirmResume = this.$confirm.find('.jsc-apply-confirm-resume');
  this.$finish = $('#jsi-finish');
  this.$finishNomail = this.$finish.find('.jsc-finish-nomail');
  this.$finishEmail = this.$finish.find('.jsc-finish-email');
  this.$finishEmailValue = this.$finish.find('.jsc-finish-email-value');
  this.$toFinish = this.$finish.find('.jsc-apply-tofinish');
  this.corporateId = this.$base.find('.jsc-apply-corporateid').val();
  this.jobId = this.$base.find('.jsc-apply-jobid').val();

  this.init();
};
SBATSJOBSP.ApplyManager.prototype = {
  ANIMATION: {
    DURATION: 300
  },

  init: function () {

    var that = this;
    var setText_twilioPhoneNum = function (){
      $.ajax({
        type : 'POST',
        contentType: 'application/json',
        dataType : 'json',
        url : '/api/twilio/onetime/issue',
        data : JSON.stringify({
          corporateId : that.corporateId
        })
      })
      .done(function( data ){
        $('.jsc-twilioPhoneNum').text(data.twilioPhoneNum);
        $('.jsc-twilioPhoneNum').closest('a').attr({ href : 'tel:' + data.twilioPhoneNum });
      });
    };

    $.ajax({
      url : '/api/twilio/status/corporateId/'+this.corporateId
    })
    .done(function( data ){
      if( data.isTwilioOpen ){
        $('.jsc-isTwilioOpen').show();
        $('.jsc-isNotTwilioOpen').hide();
        setText_twilioPhoneNum();
      }else{
        $('.jsc-isTwilioOpen').hide();
        $('.jsc-isNotTwilioOpen').show();
      }
    });

    this.bindEvents();

    if (location.hash === '#apply') {
      this.show(true);
    }
  },
  bindEvents: function () {
    var _this = this;

    this.$trigger.on('click', function () {
      _this.show();
    });
    this.$inputsValidate.on('input', function () {
      _this.validate($(this));
    });
    this.$toConfirm.on('click', function () {
      _this.stepConfirm();
    });
    this.$toBasic.on('click', function () {
      _this.stepBasic();
    });
    this.$toFinish.on('click', function () {
      _this.hide();
    });
    this.$submit.on('click', function () {
      _this.submit();
    });
    this.$privacyCheck.on('change', function () {
      _this.validate(_this.$inputs.eq(0));
    });
  },
  show: function (isNotAnimation) {
    if (this.$trigger.hasClass('applied')) {
      return;
    }

    var durationTarget = isNotAnimation ? 0 : this.ANIMATION.DURATION;

    this.$base.stop().animate({
      left: 0
    }, durationTarget, $.proxy(function () {
      this.$wrapper.hide();
      this.$htmlbody.scrollTop(0);
      this.$base.css('position', 'static');
    }, this));
  },
  hide: function () {
    this.$base.css('position', 'fixed');
    this.$confirm.css('position', 'fixed');
    this.$finish.css('position', 'fixed');

    this.$base.add(this.$confirm).add(this.$finish)
      .show().stop().animate({
        left: '100%'
      }, this.ANIMATION.DURATION);

    this.$wrapper.show();
    this.$htmlbody.scrollTop(0);
  },
  stepConfirm: function () {
    if (!this.$toConfirm.hasClass('go')) {
      return;
    }

    this.viewConfirm();

    this.$confirm.stop().animate({
      left: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$base.hide();
      this.$htmlbody.scrollTop(0);
      this.$confirm.css('position', 'static');
    }, this));
  },
  stepBasic: function () {
    this.$confirm.css('position', 'fixed');
    this.$confirm.stop().animate({
      left: '100%'
    });
    this.$base.show();
    this.$htmlbody.scrollTop(0);
  },
  stepFinish: function () {
    this.$finish.stop().animate({
      left: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$confirm.hide();
      this.$htmlbody.scrollTop(0);
      this.$finish.css('position', 'static');
    }, this));
  },
  validate: function ($inputTarget) {
    var
      _this = this,
      isValid = true;

    if ($inputTarget.is('[data-required]')) {
      this.validateRequired($inputTarget, isValid, true);
    }

    if ($inputTarget.is('[data-other-required]')) {
      this.validateOtherRequired($inputTarget, isValid, true);
    }

    if ($inputTarget.is('[data-phone]')) {
      this.validatePhone($inputTarget, isValid, true);
    }

    if ($inputTarget.is('[data-email]')) {
      this.validateEmail($inputTarget, isValid, true);
    }

    this.$inputsValidate.each(function () {
      var $target = $(this);

      if ($target.is('[data-required]')) {
        isValid = _this.validateRequired($target, isValid);
      }

      if ($target.is('[data-other-required]')) {
        isValid = _this.validateOtherRequired($target, isValid);
      }

      if ($target.is('[data-phone]')) {
        isValid = _this.validatePhone($target, isValid);
      }

      if ($target.is('[data-email]')) {
        isValid = _this.validateEmail($target, isValid);
      }

      if ($target.is('[data-date]')) {
        isValid = _this.validateDate($target, isValid);
      }
    });

    if (isValid) {
      if (this.$privacyCheck.is(':checked')) {
        this.$toConfirm.addClass('go');
        this.$toConfirm.text('確認画面へ');
      } else {
        this.$toConfirm.removeClass('go');
        this.$toConfirm.text('プライバシーポリシーをご確認ください');
      }
    } else {
      this.$toConfirm.removeClass('go');
      this.$toConfirm.text('入力エラーがあります');
    }
  },
  validateRequired: function ($target, isValid, isInputed) {
    if (!$target.val()) {
      if (isInputed) {
        $target.siblings('.jsc-data-required').show();
        $target.addClass('error');
      }

      isValid = false;
    } else if (isInputed) {
      $target.siblings('.jsc-data-required').hide();
      $target.removeClass('error');
    }

    return isValid;
  },
  validateOtherRequired: function ($target, isValid, isInputed) {
    var isOtherValid = false;

    this.$inputsValidate.filter('[data-other-required]').each(function () {
      var $targetOtherRequired = $(this);

      if ($targetOtherRequired.val()) {
        isOtherValid = true;
        return;
      }
    });

    if (!isOtherValid) {
      if (isInputed) {
        $('.jsc-data-other-required').show();
        this.$inputsValidate.filter('[data-other-required]').addClass('error');
      }

      isValid = false;
    } else if (isInputed) {
      $('.jsc-data-other-required').hide();
      this.$inputsValidate.filter('[data-other-required]').removeClass('error');
    }

    return isValid;
  },
  validatePhone: function ($target, isValid, isInputed) {
    var phonenumber = $target.val();
    // NOTE(litchi) use google i18n libphonenumber. scalaのバリデーションと一致させるため
    var locale = 'JP';
    // (↓Grab the parser.)
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var ExtraReads = {};
    // Parse the phone number.
    ExtraReads.phone = function( o ){
      try {
        var parsed = phoneUtil.parse(o, locale);
        if (phoneUtil.isValidNumber(parsed))
          return true;
        else
          return false;
      } catch (error) {
        return false;
      }
    };

    if ( !(phonenumber && phonenumber.length <= 25 && ExtraReads.phone(phonenumber)) ) {
      if (isInputed) {
        $target.siblings('.jsc-data-phone').show();
        $target.addClass('phone');
      }

      isValid = false;
    } else if (isInputed) {
      $target.siblings('.jsc-data-phone').hide();
      $target.removeClass('phone');
    }

    return isValid;
  },
  validateEmail: function ($target, isValid, isInputed) {
    // NOTE(omiend):もしかしたら[input type="email"]を使えば不要かも
    if (!/^\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\b$/.test($target.val()) && $target.val()) {
      if (isInputed) {
        $target.siblings('.jsc-data-email').show();
        $target.addClass('email');
      }

      isValid = false;
    } else if (isInputed) {
      $target.siblings('.jsc-data-email').hide();
      $target.removeClass('email');
    }

    return isValid;
  },
  viewConfirm: function () {
    var
      deferredConvertMessage,
      deferredConvertResume,
      valueName = this.$inputs.filter('[name="profile.fullName"]').val(),
      valueNameKana = this.$inputs.filter('[name="profile.fullNameKana"]').val(),
      valuePhone = this.$inputs.filter('[name="profile.phone"]').val(),
      valueEmail = this.$inputs.filter('[name="profile.email"]').val(),
      valueLastOrganization = this.$inputs.filter('[name="profile.lastOrganization"]').val(),
      valueLastTitle = this.$inputs.filter('[name="profile.lastTitle"]').val(),
      valueBirthDateYear = this.$inputs.filter('[name="profile.birthDate.year"]').val(),
      valueBirthDateMonth = this.$inputs.filter('[name="profile.birthDate.month"]').val(),
      valueBirthDateDay = this.$inputs.filter('[name="profile.birthDate.day"]').val();

    deferredConvertMessage = $.ajax({
      type: 'post',
      contentType: 'application/json',
      dataType: 'json',
      url: '/api/utils/markdown-to-html',
      data: JSON.stringify({
        markdownText: this.$inputs.filter('[name="message"]').val()
      })
    });

    deferredConvertResume = $.ajax({
      type: 'post',
      contentType: 'application/json',
      dataType: 'json',
      url: '/api/utils/markdown-to-html',
      data: JSON.stringify({
        markdownText: this.$inputs.filter('[name="resumeFreeText"]').val()
      })
    });

    deferredConvertMessage.done($.proxy(function (res) {
      this.$confirmMessage.html(res.htmlText);
    }, this));

    deferredConvertResume.done($.proxy(function (res) {
      this.$confirmResume.html(res.htmlText);
    }, this));

    this.$confirmFullName.text(valueName);
    this.$confirmFullNameKana.text(valueNameKana);
    this.$confirmPhone.text(valuePhone);
    this.$confirmEmail.text(valueEmail);
    this.$confirmLastOrganization.text(valueLastOrganization);
    this.$confirmLastTitle.text(valueLastTitle);

    if (
      valueBirthDateYear &&
      valueBirthDateMonth &&
      valueBirthDateDay
    ) {
      this.$confirmBirthDate.text(
        valueBirthDateYear + '年' +
        valueBirthDateMonth + '月' +
        valueBirthDateDay + '日'
      );
    } else {
      this.$confirmBirthDate.text('');
    }
  },
  submit: function () {
    var
      data = {};

    if (this.$trigger.hasClass('applied')) {
      return;
    }

    this.$inputs.filter('[name]').each(function () {
      var
        _this = this,
        name = $(this).attr('name'),
        value = $(this).val(),
        names = name.split('.');

      if (!value) {
        return true;
      }

      if (/\./.test(name)) {
        if (data[names[0]] === undefined) {
          data[names[0]] = {};
        }

        if (names[1] === 'birthDate') {
          data[names[0]][names[1]] = data[names[0]][names[1]] || {};
          data[names[0]][names[1]][names[2]] = parseInt(value, 10);
        } else {
          data[names[0]][names[1]] = value;
        }
      } else {
        data[name] = value;
      }
    });

    if (data.profile.birthDate) {
      if (!(
        data.profile.birthDate.year &&
        data.profile.birthDate.month &&
        data.profile.birthDate.day
      )) {
        delete data.profile.birthDate;
      }
    }

    var deferredApply = $.ajax({
      type: 'post',
      contentType: 'application/json',
      dataType: 'json',
      url: '/boards/' + this.corporateId + '/jobs/' + this.jobId + '/apply',
      data: JSON.stringify(data)
    });

    deferredApply.done($.proxy(function () {
      this.$trigger.addClass('applied').text('この求人は応募済みです');

      if (data.profile.email) {
        this.$finishEmail.addClass('show');
        this.$finishEmailValue.text(data.profile.email);
      } else {
        this.$finishNomail.addClass('show');
      }

      this.stepFinish();
    }, this));
  }
};

$(function () {
  new SBATSJOBSP.ApplyManager();
});



SBATSJOBSP.PhoneApplyManager = function () {
  this.$htmlbody = $('html, body');
  this.$wrapper = $('#jsi-wrapper');
  this.$base = $('#jsi-phone-apply');
  this.$trigger = $('#jsi-phone-apply-trigger');
  this.$close = $('.jsc-apply-close');
  this.init();
};
SBATSJOBSP.PhoneApplyManager.prototype = {
  ANIMATION: {
    DURATION: 300
  },

  init: function () {
    this.bindEvents();

    if (location.hash === '#phone-apply') {
      this.show(true);
    }
  },
  bindEvents: function () {
    var _this = this;

    this.$trigger.on('click', function () {
      _this.show();
    });
    this.$close.on('click', function () {
      _this.hide();
    });
  },
  show: function (isNotAnimation) {
    var durationTarget = isNotAnimation ? 0 : this.ANIMATION.DURATION;

    this.$base.stop().animate({
      left: 0
    }, durationTarget, $.proxy(function () {
      this.$wrapper.hide();
      this.$htmlbody.scrollTop(0);
      this.$base.css('position', 'static');
    }, this));
  },
  hide: function () {
    this.$base.css('position', 'fixed');
    this.$base.add(this.$confirm).add(this.$finish)
      .show().stop().animate({
        left: '100%'
      }, this.ANIMATION.DURATION);

    this.$wrapper.show();
    this.$htmlbody.scrollTop(0);
  }
};

$(function () {
  new SBATSJOBSP.PhoneApplyManager();
});
