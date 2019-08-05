// lazyload by Joel
// Image Lazy Loading
let lazyload = (function() {
    'use strict';
    let publicFuncs = {};

    publicFuncs.init = function() {
        let imgs = $('img');

        imgs.each(function() {
            let _this = $(this);
            
            _this.attr('data-src', _this.attr('src'));
            _this.attr('src', '/img/placeholder.jpg');
        });

        const observer = lozad('img', {
            load: function(el) {
                el.src = el.dataset.src ? el.dataset.src : el.src;
                el.onload = function() {
                    $(el).addClass('animated faster fadeIn').one(animationEnd, function() {
                        $(this).removeClass('animated faster fadeIn');
                    });
                }
            }
        });

        observer.observe();
    }

    return publicFuncs;
});