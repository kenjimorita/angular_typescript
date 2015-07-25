var SBATSJOB = window.SBATSJOB || {};

// EMAIL APPLICATION
SBATSJOB.ApplyManager = function () {
  this.$win = $(window);
  this.$body = $(document.body);
  this.$base = $('#jsi-apply');
  this.$filter = $('#jsi-filter').length ? $('#jsi-filter') : $('<div id="jsi-filter" />');
  this.$trigger = $('.jsc-apply-trigger');
  this.$toBasic = $('.jsc-apply-tobasic');
  this.$toResume = $('.jsc-apply-toresume');
  this.$toConfirm = $('.jsc-apply-toconfirm');
  this.$privacyCheck = $('#privacy');
  this.$submit = this.$base.find('.jsc-apply-submit');
  this.$submitHead = this.$submit.filter('.jsc-apply-submit-head');
  this.$inputs = this.$base.find('input, select, textarea');
  this.$inputsValidate = this.$inputs.filter('[data-required], [data-other-required], [data-phone], [data-email], [data-date]');
  this.$sectionBasic = this.$base.find('.jsc-apply-basic');
  this.$sectionResume = this.$base.find('.jsc-apply-resume');
  this.$sectionConfirm = this.$base.find('.jsc-apply-confirm');
  this.$resumeTextarea = this.$base.find('.jsc-apply-resume-textarea');
  this.$dropzone = this.$base.find('.jsc-apply-dropzone');
  this.$fileWrapper = this.$base.find('.jsc-apply-filewrapper');
  this.$fileMaxText = this.$fileWrapper.find('> p');
  this.$inputFile = this.$fileWrapper.find('.jsc-apply-file');
  this.$files = this.$base.find('.jsc-apply-files');
  this.$confirmFullName = this.$base.find('.jsc-apply-confirm-fullname');
  this.$confirmFullNameKana = this.$base.find('.jsc-apply-confirm-fullnamekana');
  this.$confirmPhone = this.$base.find('.jsc-apply-confirm-phone');
  this.$confirmEmail = this.$base.find('.jsc-apply-confirm-email');
  this.$confirmLastOrganization = this.$base.find('.jsc-apply-confirm-lastorganization');
  this.$confirmLastTitle = this.$base.find('.jsc-apply-confirm-lasttitle');
  this.$confirmBirthDate = this.$base.find('.jsc-apply-confirm-birthdate');
  this.$confirmMessage = this.$base.find('.jsc-apply-confirm-message');
  this.$confirmResume = this.$base.find('.jsc-apply-confirm-resume');
  this.attachments = [];
  this.corporateId = this.$base.find('.jsc-apply-corporateid').val();
  this.jobId = this.$base.find('.jsc-apply-jobid').val();
  this.init();
};
SBATSJOB.ApplyManager.prototype = {
  ANIMATION: {
    DURATION: 300
  },
  HEIGHT: {
    BARSINGLE: 81,
    BARDOUBLE: 162,
    BARNOMARGIN: 80
  },
  CLASS: {
    YET: 'yet',
    DONE: 'done'
  },

  init: function () {
    this.$filter.css({
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      opacity: 0
    });
    this.repositioningSections();
    this.prepareValidate();

    if (location.hash === '#apply') {
      this.show(true);
    }

    var that = this;
    var setText_twilioPhoneNum = function(){
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
  },
  bindEvents: function () {
    var _this = this;

    this.$win.on('resize', function () {
      _this.repositioningSections();
    });
    this.$submit.on('click', function () {
      _this.submit();
    });
    this.$trigger.on('click', function () {
      _this.show();
    });
    this.$toBasic.on('click', function (e) {
      _this.stepBasic(true);
      e.stopPropagation();
    });
    this.$toResume.on('click', function (e) {
      _this.stepResume(true);
      e.stopPropagation();
    });
    this.$toConfirm.on('click', function (e) {
      _this.stepConfirm(true);
      e.stopPropagation();
    });
    this.$sectionBasic.on('click', function () {
      _this.stepBasic();
    });
    this.$sectionResume.on('click', function () {
      _this.stepResume();
    });
    this.$sectionConfirm.on('click', function () {
      _this.stepConfirm();
    });
    this.$resumeTextarea.on('dragenter', function () {
      _this.showDropzone();
    });
    this.$dropzone.on('dragleave', function () {
      _this.hideDropzone();
    });
    this.$dropzone.on('drop', function (e) {
      _this.uploadFile(e.originalEvent.dataTransfer.files[0]);
    });
    this.$dropzone.on('dragenter dragstart dragend drageleave dragover drag drop', function (e) {
      e.preventDefault();
    });
    this.$inputFile.on('change', function (e) {
      _this.uploadFile(e.target.files[0]);
    });
    this.$inputsValidate.on('input', function () {
      _this.validate($(this));
    });
    this.$filter.on('click', function () {
      _this.hide();
    });
    this.$files.on('click', 'a', function () {
      _this.removeAttachment($(this));
    });
    this.$privacyCheck.on('change', function () {
      _this.validatePrivacy();
    });
  },
  prepareValidate: function () {
    this.$inputsValidate.filter('[data-required]').each(function () {
      $(this).after($('<p class="error jsc-data-required">' + $(this).attr('data-required') + '</p>').hide());
    });
    this.$inputsValidate.filter('[data-other-required]').each(function () {
      $(this).after($('<p class="error jsc-data-other-required">' + $(this).attr('data-other-required') + '</p>').hide());
    });
    this.$inputsValidate.filter('[data-phone]').each(function () {
      $(this).after($('<p class="error jsc-data-phone">' + $(this).attr('data-phone') + '</p>').hide());
    });
    this.$inputsValidate.filter('[data-email]').each(function () {
      $(this).after($('<p class="error jsc-data-email">' + $(this).attr('data-email') + '</p>').hide());
    });
    this.$inputsValidate.filter('[data-date]').each(function () {
      $(this).after($('<p class="error jsc-data-date">' + $(this).attr('data-date') + '</p>').hide());
    });
  },
  removeAttachment: function ($target) {
    var
      indexTarget = this.$files.find('a').index($target);

      this.attachments.splice(indexTarget, 1);
      this.viewAttachments();
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

    if ($inputTarget.is('[data-date]')) {
      this.validateDate($inputTarget, isValid, true);
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
      this.$toResume.removeAttr('disabled').removeClass('sg-button-disabled');
    } else {
      this.$toResume.attr('disabled', true).addClass('sg-button-disabled');
    }
  },
  validatePrivacy: function () {
    if (this.$privacyCheck.is(':checked')) {
      this.$submit.add(this.$submitHead)
        .removeAttr('disabled')
        .removeClass('sg-button-disabled')
        .prop('disabled', false)
        .text('この内容で応募を確定');
    } else {
      this.$submit.add(this.$submitHead)
        .attr('disabled', true)
        .addClass('sg-button-disabled')
        .prop('disabled', true)
        .text('プライバシーポリシーをご確認ください');
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
        this.$inputsValidate.filter('[data-other-required]').siblings('.jsc-data-other-required').show();
        this.$inputsValidate.filter('[data-other-required]').addClass('error');
      }

      isValid = false;
    } else if (isInputed) {
      this.$inputsValidate.filter('[data-other-required]').siblings('.jsc-data-other-required').hide();
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
  validateDate: function ($target, isValid, isInputed) {
    if (!/^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}$/.test($target.val()) && $target.val()) {
      if (isInputed) {
        $target.siblings('.jsc-data-date').show();
        $target.addClass('error');
      }

      isValid = false;
    } else if (isInputed) {
      $target.siblings('.jsc-data-date').hide();
      $target.removeClass('error');
    }

    return isValid;
  },
  submit: function () {
    var
      data = {};

    if (!this.$privacyCheck.is(':checked')) {
      return;
    }

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

    if (this.attachments.length) {
      var now = new Date();

      data.attachmentIds = [];

      $.each(this.attachments, function () {
        data.attachmentIds.push({
          fileId: this.fileId,
          yearMonth: this.yearMonth
        });
      });
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
      this.hide();
    }, this));

    deferredApply.fail($.proxy(function () {
      new SBATSJOB.ErrorToast('応募処理に失敗しました');
    }, this));
  },
  show: function (isNotAnimation) {
    if (this.$trigger.hasClass('applied')) {
      return;
    }

    this.$base.before(this.$filter);
    this.$filter.show().stop().animate({
      opacity: 1
    }, isNotAnimation ? 0 : this.ANIMATION.DURATION);
    this.$base.show().stop().animate({
      opacity: 1
    }, isNotAnimation ? 0 : this.ANIMATION.DURATION);
  },
  hide: function () {
    this.$filter.stop().animate({
      opacity: 0
    }, 300, $.proxy(function () {
      this.$filter.hide();
    }, this));
    this.$base.stop().animate({
      opacity: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$base.hide();
    }, this));
  },
  repositioningSections: function () {
    if (
      !this.$sectionBasic.hasClass(this.CLASS.YET) &&
      !this.$sectionBasic.hasClass(this.CLASS.DONE)
    ) {
      this.$sectionBasic.css({
        height: this.$base.height() - this.HEIGHT.BARDOUBLE
      });
    }

    if (
      !this.$sectionResume.hasClass(this.CLASS.YET) &&
      !this.$sectionResume.hasClass(this.CLASS.DONE)
    ) {
      this.$sectionResume.css({
        height: this.$base.height() - this.HEIGHT.BARDOUBLE
      });
    }

    if (
      !this.$sectionConfirm.hasClass(this.CLASS.YET) &&
      !this.$sectionConfirm.hasClass(this.CLASS.DONE)
    ) {
      this.$sectionConfirm.css({
        height: this.$base.height() - this.HEIGHT.BARDOUBLE
      });
    }

    if (this.$sectionResume.hasClass(this.CLASS.YET)) {
      this.$sectionResume.css({
        top: this.$base.height() - this.HEIGHT.BARDOUBLE,
        height: this.HEIGHT.BARNOMARGIN
      });
    }

    if (this.$sectionConfirm.hasClass(this.CLASS.YET)) {
      this.$sectionConfirm.css({
        top: this.$base.height() - this.HEIGHT.BARSINGLE,
        height: this.HEIGHT.BARNOMARGIN
      });
    }
  },
  stepBasic: function () {
    if (
      !this.$sectionBasic.hasClass(this.CLASS.YET) &&
      !this.$sectionBasic.hasClass(this.CLASS.DONE)
    ) {
      return;
    }

    this.$sectionBasic.stop().animate({
      height: this.$base.height() - this.HEIGHT.BARDOUBLE
    }, this.ANIMATION.DURATION);
    this.$sectionBasic.removeClass(this.CLASS.DONE);

    this.$submitHead.stop().animate({
      opacity: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$submitHead.hide();
    }, this));

    this.$sectionResume.stop().animate({
      top: this.$base.height() - this.HEIGHT.BARDOUBLE,
      height: this.HEIGHT.BARNOMARGIN,
      scrollTop: 0
    }, this.ANIMATION.DURATION);
    this.$sectionResume.removeClass(this.CLASS.DONE);
    this.$sectionResume.addClass(this.CLASS.YET);

    this.$sectionConfirm.stop().animate({
      top: this.$base.height() - this.HEIGHT.BARSINGLE,
      height: this.HEIGHT.BARNOMARGIN,
      scrollTop: 0
    }, this.ANIMATION.DURATION);
    this.$sectionConfirm.addClass(this.CLASS.YET);
  },
  stepResume: function (isFromButton) {
    if (
      (this.$sectionResume.hasClass(this.CLASS.YET) && !isFromButton) ||
      this.$toResume.is('[disabled]')
    ) {
      return;
    }

    this.$submitHead.stop().animate({
      opacity: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$submitHead.hide();
    }, this));

    this.$sectionBasic.stop().animate({
      height: this.HEIGHT.BARNOMARGIN,
      scrollTop: 0
    }, this.ANIMATION.DURATION);
    this.$sectionBasic.addClass(this.CLASS.DONE);

    this.$sectionResume.stop().animate({
      top: this.HEIGHT.BARSINGLE,
      height: this.$base.height() - this.HEIGHT.BARDOUBLE
    }, this.ANIMATION.DURATION);
    this.$sectionResume.removeClass(this.CLASS.YET + ' ' + this.CLASS.DONE);

    this.$sectionConfirm.stop().animate({
      top: this.$base.height() - this.HEIGHT.BARSINGLE,
      height: this.HEIGHT.BARNOMARGIN,
      scrollTop: 0
    }, this.ANIMATION.DURATION);
    this.$sectionConfirm.addClass(this.CLASS.YET);
  },
  stepConfirm: function (isFromButton) {
    if (this.$sectionConfirm.hasClass(this.CLASS.YET) && !isFromButton) {
      return;
    }

    if (this.$privacyCheck.is(':checked')) {
      this.$submitHead.show().stop().animate({
        opacity: 1
      }, this.ANIMATION.DURATION);
    } else {
      this.$submitHead.show().stop().animate({
        opacity: 0.5
      }, this.ANIMATION.DURATION);
    }

    this.$sectionBasic.stop().animate({
      height: this.HEIGHT.BARNOMARGIN,
      scrollTop: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$sectionBasic.css('bottom', 'auto');
    }, this));
    this.$sectionBasic.addClass(this.CLASS.DONE);

    this.$sectionResume.stop().animate({
      top: this.HEIGHT.BARSINGLE,
      height: this.HEIGHT.BARNOMARGIN,
      scrollTop: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$sectionResume.css({
        bottom: 'auto'
      });
    }, this));
    this.$sectionResume.removeClass(this.CLASS.YET);
    this.$sectionResume.addClass(this.CLASS.DONE);

    this.$sectionConfirm.stop().animate({
      top: this.HEIGHT.BARDOUBLE,
      bottom: 0,
      height: this.$base.height() - this.HEIGHT.BARDOUBLE
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$sectionConfirm.css({
        top: this.HEIGHT.BARDOUBLE,
        bottom: 'auto'
      });
    }, this));
    this.$sectionConfirm.removeClass(this.CLASS.YET);
    this.viewConfirm();
  },
  showDropzone: function () {
    this.$dropzone.show().stop().animate({
      opacity: 1
    }, this.ANIMATION.DURATION);
  },
  hideDropzone: function () {
    this.$dropzone.stop().animate({
      opacity: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$dropzone.hide();
    }, this));
  },
  uploadFile: function (file) {
    this.hideDropzone();

    if (!file) {
      return;
    }

    var formData = new FormData();

    formData.append('attachment', file);

    var deferredAjax = $.ajax({
      type: 'post',
      url: '/boards/' + this.corporateId + '/jobs/' + this.jobId + '/attachment',
      data: formData,
      processData: false,
      contentType: false
    });

    deferredAjax.done($.proxy(function (e) {
      this.$inputFile.val('');
      this.attachments.push(e);
      this.viewAttachments();
    }, this));
    deferredAjax.fail($.proxy(function (e) {
      if (e.status === 413) {
        new SBATSJOB.ErrorToast('ご指定のファイル容量が上限を超えています（上限:5MB）');
      } else {
        new SBATSJOB.ErrorToast('ファイルの一時アップロードに失敗しました');
      }
    }, this));
  },
  viewAttachments: function () {
    var _this = this;

    this.$files.html('');

    $.each(this.attachments, function () {
      _this.$files.append($('<li class="' + this.fileType + '">' + this.fileName + '<a href="javascripts: void(0);">削除</a></li>'));
    });

    if (this.attachments.length === 5) {
      this.$inputFile.hide();
      this.$fileMaxText.show();
    } else {
      this.$inputFile.show();
      this.$fileMaxText.hide();
    }
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
  getFormattedBirthDate: function (valueTarget) {
    if (!valueTarget) {
      return false;
    }

    var
      response,
      valuesTarget = valueTarget.split('/'),
      dateTarget = new Date(
        parseInt(valuesTarget[0], 10),
        parseInt(valuesTarget[1], 10) - 1,
        parseInt(valuesTarget[2], 10)
      ),
      dateNow = new Date(),
      diffForAge = 0;

    diffForAge = dateNow.getTime() - dateTarget.getTime();
    diffForAge = Math.floor(diffForAge / 1000 / 60 / 60 / 24 / 365);

    response =
      dateTarget.getFullYear() + '年' +
      (dateTarget.getMonth() + 1) + '月' +
      dateTarget.getDate() + '日' +
      '（' + diffForAge + '歳）';

    return response;
  }
};

SBATSJOB.MaxLength = function ($base) {
  this.$base = $base;
  this.$tooltip = this.$base.find('.jsc-maxlength-tooltip');
  this.$input = this.$base.find('input');
  this.$count = this.$base.find('.jsc-maxlength-count');
  this.$max = this.$base.find('.jsc-maxlength-max');

  this.init();
};
SBATSJOB.MaxLength.prototype = {
  ANIMATION: {
    DURATION: 300
  },

  init: function () {
    this.changeCount();
    this.bindEvents();
  },
  bindEvents: function () {
    var _this = this;

    this.$input.on('focus', function () {
      _this.show();
    });
    this.$input.on('blur', function () {
      _this.hide();
    });
    this.$input.on('input', function () {
      _this.changeCount();
    });
  },
  show: function () {
    this.$tooltip.show().stop().animate({
      opacity: 1
    }, this.ANIMATION.DURATION);
  },
  hide: function () {
    this.$tooltip.stop().animate({
      opacity: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$tooltip.hide();
    }, this));
  },
  changeCount: function () {
    this.$max.text(this.$input.attr('maxlength'));
    this.$count.text(this.$input.val().length);
  }
};

SBATSJOB.ErrorToast = function (textTarget) {
  this.textTarget = textTarget;
  this.$base = $('<div/>').addClass('pg-toast');
  this.$body = $(document.body);

  this.show();
};
SBATSJOB.ErrorToast.prototype = {
  DURATION: 300,

  show: function () {
    this.$base.text(this.textTarget);
    this.$body.append(this.$base);
    this.$base.show().stop().animate({
      opacity: 1
    }, this.DURATION, $.proxy(function () {
      setTimeout($.proxy(function () {
        this.$base.stop().animate({
          opacity: 0
        }, $.proxy(function () {
          this.$base.remove();
        }, this));
      }, this), 3000);
    }, this));
  }
};

$(function () {
  new SBATSJOB.ApplyManager();

  $('.jsc-maxlength').each(function () {
    new SBATSJOB.MaxLength($(this));
  });
});



// PHONE APPLICATION
SBATSJOB.PhoneApplyManager = function () {
  this.$win = $(window);
  this.$body = $(document.body);
  this.$filter = $('#jsi-phone-filter').length ? $('#jsi-phone-filter') : $('<div id="jsi-phone-filter" />');
  this.$base = $('#jsi-phone-apply');
  this.$trigger = $('.jsc-phone-apply-trigger');
  this.$close = $('.jsc-apply-close');
  this.init();
};
SBATSJOB.PhoneApplyManager.prototype = {
  ANIMATION: {
    DURATION: 300
  },
  init: function () {
    this.$filter.css({
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      opacity: 0
    });
    if (location.hash === '#apply-phone') {
      this.show(true);
    }
    this.bindEvents();
  },
  bindEvents: function () {
    var _this = this;
    this.$trigger.on('click', function () {
      _this.show();
    });
    this.$close.on('click', function () {
      _this.hide();
    });
    this.$filter.on('click', function () {
      _this.hide();
    });
  },
  show: function (isNotAnimation) {
    this.$base.before(this.$filter);
    this.$filter.show().stop().animate({
      opacity: 1
    }, isNotAnimation ? 0 : this.ANIMATION.DURATION);
    this.$base.show().stop().animate({
      opacity: 1
    }, isNotAnimation ? 0 : this.ANIMATION.DURATION);
  },
  hide: function () {
    this.$filter.stop().animate({
      opacity: 0
    }, 300, $.proxy(function () {
      this.$filter.hide();
    }, this));
    this.$base.stop().animate({
      opacity: 0
    }, this.ANIMATION.DURATION, $.proxy(function () {
      this.$base.hide();
    }, this));
  },
};

$(function () {
  new SBATSJOB.PhoneApplyManager();

  // $('.jsc-maxlength').each(function () {
  //   new SBATSJOB.MaxLength($(this));
  // });
});
