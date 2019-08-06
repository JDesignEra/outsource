// index by Joel
let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations) {
    let wrappers = $('.card-wrapper', 'section.home');

    mutations.forEach((obj, i) => {
        let height = obj.target.attributes[1].nodeValue;
        height = parseFloat(height.slice(7, -3));

        if  (height > 0) {
            let wrapper = $(wrappers[i]);
            let faces = wrapper.find('.face');

            faces.each(function() {
                let _this = $(this);
                let imgTop = _this.find('.card-img-top');

                _this.addClass('h-100');

                imgTop.each(function(el) {
                    let _this = $(this);
                    let overlay = $(this).parent('.view.overlay');

                    let overlayHeight = overlay.height();
                    let imgHeight = _this.outerHeight();

                    if (imgHeight > overlayHeight) {
                        let calcMargin = Math.abs((imgHeight - overlayHeight) / 2);
    
                        imgTop.css('margin-top', `-${calcMargin}px`);
                    }

                    if (height - imgHeight < 300) {
                        _this.parent().parent('face').find('.card-body').css('max-height', `300px`);
                    }
                    else {
                        _this.parent().parent('face').css('max-height', `${height - imgHeight}px`);
                    }
                });

                if (_this.hasClass('front')) {
                    let content = _this.find('.flex-fill.overflow-auto.card-text');
                    let contentImg = content.find('img');
                    
                    contentImg.each(function() {
                        let _this = $(this);
                        let align = _this.parent().css('text-align');
    
                        if (align === 'center') {
                            _this.addClass('mx-auto');
                        }
                    });
                }
            });
        }
    });
});

let wrapper = document.querySelectorAll('section.home .card-wrapper');

wrapper.forEach(el => {
    observer.observe(el, {
        subtree: false,
        attributes: true,
        attributeFilter: ['style']
    });
});