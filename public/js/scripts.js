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

$(function(){
    objectFitImages();

    jarallax(document.querySelectorAll('.jarallax'));
    
    jarallax(document.querySelectorAll('.jarallax-keep-img'), {
        keepImg: true,
    });
});
