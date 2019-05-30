/* Joel */
let animationEnd = (function(el) {
    let animations = {
        "animation": "animationend",
        "OAnimation": "oAnimationEnd",
        "MozAnimation": "mozAnimationEnd",
       "WebkitAnimation": "webkitAnimationEnd"
    };

    for(var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
})(document.createElement("fakeelement"));

$(window).scroll(function() {
    let focus = $('#toTopAction');

    if ($('nav.navbar').offset().top > 100) {
        if (focus.hasClass('d-none')) {
            focus.removeClass('d-none');

            focus.addClass('fadeIn').one(animationEnd, function() {
                $(this).removeClass('fadeIn');
            });
        }
    }
    else {
        if (!focus.hasClass('d-none')) {
            focus.addClass('fadeOut').one(animationEnd, function() {
                $(this).addClass('d-none');
                $(this).removeClass('fadeOut');
            });
        }
    }
});

$(function() {
    // tooltips
    $('[data-tooltip="tooltip"].material-tooltip-sm[data-placement="top"]').tooltip({
        template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>',
        offset: '10px, 0'
    });

    $('[data-tooltip="tooltip"]').tooltip();
});

$(function () {
    $(".sticky").sticky({
        topSpacing: 90,
        zIndex: 2,
        stopper: "footer"
    });
});

/* Lemuel */
$(function(){
    objectFitImages();

    jarallax(document.querySelectorAll('.jarallax'));
    
    jarallax(document.querySelectorAll('.jarallax-keep-img'), {
        keepImg: true,
    });
});

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
})