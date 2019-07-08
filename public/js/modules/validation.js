// validation by Joel
let validation = (function() {
    'use strict';
    let publicFuncs = {};
    
    publicFuncs.init = function() {
        let forms = $('form.needs-validation');
        let allFeedbacks = forms.find('.invalid-tooltip, .invalid-feedback, .valid-tooltip, .valid-feedback');

        responsive(allFeedbacks);

        $(window).on('resize', function() {
            responsive(allFeedbacks);
        });

        forms.each(function() {
            let flag = false;
            let form = $(this);
            let feedbacks = form.find('.invalid-tooltip, .invalid-feedback, .valid-tooltip, .valid-feedback');
            
            feedbacks.each(function() {
                let _this = $(this);

                if (_this.text().trim()) {
                    flag = true;

                    if (_this.hasClass('invalid-tooltip') || _this.hasClass('invalid-feedback')) {
                        $(_this.prevAll('input')[0]).addClass('is-invalid');
                    }
                    else if (_this.hasClass('valid-tooltip') || _this.hasClass('valid-feedback')) {
                        $(_this.prevAll('input')[0]).addClass('is-valid')
                    }

                    let find = _this.nextAll('.form-text');
    
                    if (find.length > 0) {
                        $(find[0]).addClass('invisible');
                    }
                    else {
                        find = _this.parent().nextAll('.form-text');

                        if (find.length > 0) {
                            $(find[0]).addClass('invisible');
                        }
                        else {
                            find = _this.parent().parent().nextAll('.form-text');

                            if (find.length > 0) {
                                $(find[0]).addClass('invisible')
                            }
                        }
                    }

                    if (_this.hasClass('invalid-tooltip') || _this.hasClass('valid-tooltip')) {
                        find = _this.closest('.input-group');
                        find.css('margin-bottom', '2.175rem');
                    }
                    else if (_this.hasClass('invalid-feedback') || _this.hasClass('valid-feedback')) {
                        find = _this.closest('.input-group');
                        find.css('margin-bottom', '1.875rem');
                    }
                    else {
                        find = _this.closest('.input-group');
                        find.css('margin-bottom', '');
                    }
                }
            });

            if (flag) {
                form.find('input:not(.is-invalid)').addClass('is-valid');
            }
        });
    }

    let responsive = function(focuses) {
        focuses.each(function() {
            _this = $(this);

            if ($(window).width() <= 767.98) {
                if (_this.hasClass('invalid-tooltip')) {
                    _this.addClass('invalid-feedback');
                    _this.removeClass('invalid-tooltip');
                }
                else if (_this.hasClass('valid-tooltip')) {
                    _this.addClass('valid-feedback');
                    _this.removeClass('valid-tooltip');
                }
            }
            else {
                if (_this.hasClass('invalid-feedback')) {
                    _this.addClass('invalid-tooltip');
                    _this.removeClass('invalid-feedback');
                }
                else if (_this.hasClass('valid-feedback')) {
                    _this.addClass('valid-tooltip');
                    _this.removeClass('valid-feedback');
                }
            }

            if (_this.hasClass('valid-feedback') || _this.hasClass('invalid-feedback')) {
                let modal = _this.parents('.modal');
                modal.addClass('d-block');
                _this.css('max-width', _this.parent().innerWidth());
                modal.removeClass('d-block');
            }
            else {
                _this.css('max-width', '');
            }
        });
    }

    return publicFuncs;
});