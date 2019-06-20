/* Joel */
// Animation End Fix
let animationEnd = animateEnd().init();

// ToTop Button
$(function() {
    $(window).scroll(function () {
        let focus = $('#toTopAction');
    
        if ($('nav.navbar').offset().top > 100 && focus.hasClass('d-none')) {
            focus.removeClass('d-none');
    
            focus.addClass('fadeIn').one(animationEnd, function () {
                $(this).removeClass('fadeIn');
            });
        }
        else if ($('nav.navbar').offset().top < 100 && !focus.hasClass('d-none')) {
            focus.addClass('fadeOut').one(animationEnd, function () {
                $(this).addClass('d-none');
                $(this).removeClass('fadeOut');
            });
        }
    });
});

// Init fileInput
$(function() {
    if ($('.files-upload')[0] !== undefined || $('.file-upload')[0] !== undefined) {
        fileInput().init();
    }
});

// Tooltips
$(function () {
    $('[data-tooltip="tooltip"].material-tooltip-sm').tooltip({
        template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>'
    });

    $('[data-tooltip="tooltip"].material-tooltip-sm[data-placement="top"]').tooltip({
        template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>',
        offset: '10px, 0'
    });

    $('[data-tooltip="tooltip"]').tooltip();
});

// Forms Validation
$(function() {
    if ($('form .invalid-tooltip')[0] !== undefined || $('form .valid-tooltip')[0] !== undefined) {
        validation().init();
    }
});

// Toast
$(function() {
    if (typeof toastMsgs !== 'undefined') {
        toast().init();
    }
});

/* Lemuel */
$(function () {
    objectFitImages();
    jarallax(document.querySelectorAll('.jarallax'));
    jarallax(document.querySelectorAll('.jarallax-keep-img'), {
        keepImg: true,
    });
});

/* Joshua */
$(function() {
    $('#posterUpload').on('change', function () {
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