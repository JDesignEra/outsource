// scripts by Joel
// Animation End Fix
let animationEnd = animateEnd().init();

// Nav
$(function() {
    let nav = $('.navbar-collapse', 'nav');

    nav.on('show.bs.collapse', function() {
        let focus = $(this).prev().children('button.navbar-toggler i');

        if (focus.hasClass('fa-bars')) {
            focus.removeClass('fa-bars');

            focus.addClass('fa-times bounceIn').one(animationEnd, function() {
                focus.removeClass('bounceIn');
            });
        }
    });

    nav.on('hide.bs.collapse', function() {
        let focus = $(this).prev().children('button.navbar-toggler i');

        if (focus.hasClass('fa-times')) {
            focus.removeClass('fa-times');

            focus.addClass('fa-bars bounceIn').one(animationEnd, function() {
                focus.removeClass('bounceIn');
            });
        }
    });
});

// ToTop Button animation
$(function() {
    let focus = $('#toTopAction');

    if (focus.length > 0) {
        $(window).scroll(function() {
            let nav = $('nav.navbar');
        
            if (nav.offset().top > 100 && focus.hasClass('d-none')) {
                focus.removeClass('d-none');
        
                focus.addClass('fadeIn').one(animationEnd, function() {
                    $(this).removeClass('fadeIn');
                });
            }
            else if (nav.offset().top < 100 && !focus.hasClass('d-none')) {
                focus.addClass('fadeOut').one(animationEnd, function() {
                    $(this).addClass('d-none');
                    $(this).removeClass('fadeOut');
                });
            }
        });
    }
});

// Init fileInput
$(function() {
    if ($('.files-upload').length > 0 || $('.file-upload').length > 0) {
        fileInput().init();
    }
});

// Init Forms Validation
$(function() {
    if ($('.invalid-tooltip', 'form').length > 0 || $('.valid-tooltip', 'form').length > 0) {
        validation().init();
    }
});

// Tooltips
$(function() {
    $('[data-tooltip="tooltip"].material-tooltip-sm').tooltip({
        template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>'
    });

    $('[data-tooltip="tooltip"].material-tooltip-sm[data-placement="top"]').tooltip({
        template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>',
        offset: '10px, 0'
    });

    $('[data-tooltip="tooltip"]').tooltip();
});

// Toast
$(function() {
    if (typeof toastMsgs !== 'undefined') {
        toast().init();
    }
});

// Material Select
$(function() {
    $('.mdb-select').material_select();
});

/* Lemuel */
$(function() {
    objectFitImages();
    jarallax(document.querySelectorAll('.jarallax'));
    jarallax(document.querySelectorAll('.jarallax-keep-img'), {
        keepImg: true,
    });
});

/* Joshua */
$(function() {
    $('#posterUpload').on('change', function() {
        let image = $("#posterUpload")[0].files[0];
        let formdata = new FormData();
        formdata.append('posterUpload', image);
        $.ajax({
            url: '/video/upload',
            type: 'POST',
            data: formdata,
            contentType: false,
            processData: false,
            'success': (data) => {
                $('#poster').attr('src', data.file);
                $('#posterURL').attr('value', data.file);// sets posterURL hidden field
                if (data.err) {
                    $('#posterErr').show();
                    $('#posterErr').text(data.err.message);
                } else {
                    $('#posterErr').hide();
                }
            }
        });
    });
});