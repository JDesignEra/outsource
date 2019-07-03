// validation by Joel
let validation = (function() {
    'use strict';
    let publicFuncs = {};
    
    publicFuncs.init = function() {
        let focuses = $('form .invalid-tooltip, form .invalid-tooltip, form .invalid-feedback, form .invalid-feedback');

        responsive(focuses);

        $(window).on('resize', function() {
            responsive(focuses);
        });
        
        focuses.each(function() {
            _this = $(this);
            
            if (_this.text().trim()) {
                if (_this.hasClass('invalid-tooltip') || _this.hasClass('invalid-feedback')) {
                    _this.parent().children('input').addClass('is-invalid');

                    let focus = _this.parent().children('.form-text');

                    if (focus.length > 0) {
                        focus.addClass('invisible');
                    }
                    else {
                        focus = _this.parents('.input-group').find('form-text');
                        console.log(focus);
                        
                        if (focus.length > 0) {
                            focus.addClass('invisible');
                        }
                        else {
                            focus = _this.parents('.input-group').next();

                            if (focus.hasClass('form-text')) {
                                focus.addClass('invisible');
                            }
                        }
                    }
                }
                else if (_this.hasClass('valid-tooltip') || _this.hasClass('invalid-feedback')) {
                    _this.parent().children('input').addClass('is-valid');

                    let focus = _this.parent().children('.form-text');

                    if (focus.length > 0) {
                        focus.removeClass('invisible');
                    }
                    else {
                        focus = _this.parents('.input-group').find('form-text');

                        if (focus.length > 0) {
                            focus.removeClass('invisible');
                        }
                        else {
                            focus = _this.parents('.input-group').next();

                            if (focus.hasClass('form-text')) {
                                focus.removeClass('invisible');
                            }
                        }
                    }
                }
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
        });
    }

    return publicFuncs;
});