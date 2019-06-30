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

                    if (_this.parent().children('.form-text').length > 0) {
                        _this.parent().children('.form-text').addClass('invisible');
                    }
                    else {
                        _this.parent().parent().next().addClass('invisible');
                    }
                }
                else if (_this.hasClass('valid-tooltip') || _this.hasClass('invalid-feedback')) {
                    _this.parent().children('input').addClass('is-valid');

                    if (_this.parent().children('.form-text').length > 0) {
                        _this.parent().children('.form-text').removeClass('invisible');
                    }
                    else {
                        _this.parent().parent().next().removeClass('invisible');
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