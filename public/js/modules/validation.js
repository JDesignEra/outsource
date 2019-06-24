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
        
        focuses.each(function(i) {
            if ($.trim($(focuses[i]).text()) !== '') {
                if ($(focuses[i]).hasClass('invalid-tooltip') || $(focuses[i]).hasClass('invalid-feedback')) {
                    $(focuses[i]).parent().children('input').addClass('is-invalid');
                }
                else if ($(focuses[i]).hasClass('valid-tooltip') || $(focuses[i]).hasClass('invalid-feedback')) {
                    $(focuses[i]).parent().children('input').addClass('is-valid');
                }
            }
        });
    }

    let responsive = function(focuses) {
        if ($(window).width() <= 767.98) {
            focuses.each(function(i) {
                if ($(focuses[i]).hasClass('invalid-tooltip')) {
                    $(focuses[i]).addClass('invalid-feedback');
                    $(focuses[i]).removeClass('invalid-tooltip');
                }
                else if ($(focuses[i]).hasClass('valid-tooltip')) {
                    $(focuses[i]).addClass('valid-feedback');
                    $(focuses[i]).removeClass('valid-tooltip');
                }
            });
        }
        else {
            focuses.each(function(i) {
                if ($(focuses[i]).hasClass('invalid-feedback')) {
                    $(focuses[i]).addClass('invalid-tooltip');
                    $(focuses[i]).removeClass('invalid-feedback');
                }
                else if ($(focuses[i]).hasClass('valid-feedback')) {
                    $(focuses[i]).addClass('valid-tooltip');
                    $(focuses[i]).removeClass('valid-feedback');
                }
            });
        }
    }

    return publicFuncs;
});