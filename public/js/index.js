// index by Joel
$(function() {
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new MutationObserver(function(mutations, observer) {
        mutations.forEach(obj => {
            console.log(obj);

            let value = obj.target.attributes[1].nodeValue;

            if (parseFloat(value.slice(7, -3)) > 0) {
                obj.target.childNodes[1].childNodes[1].classList.add('h-100');
                obj.target.childNodes[1].childNodes[3].classList.add('h-100');
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

    let cardWrapper = $('.card-wrapper', 'section.home');
    let cardFaces = cardWrapper.find('.face');

    cardWrapper = $('.card-wrapper', 'section.portfolio-views, section.random-portfolios');

    cardWrapper.each(function() {
        let wrapper = $(this);
        let cardFaces = cardWrapper.find('.face');

        cardFaces.each(function() {
            let _this = $(this);
            let height = parseFloat(wrapper.css('height'));
            let overlayHeight = _this.find('.view.overlay').height();
            let imgTop = _this.find('.card-img-top');
            let imgHeight = imgTop.height();

            if (!_this.hasClass('h-100')) {
                _this.addClass('h-100');
            };

            if (imgHeight > overlayHeight) {
                let calcMargin = Math.abs((imgHeight - overlayHeight) / 2);
                imgTop.css('margin-top', `${-calcMargin}px`);
            }
            
            if (height - imgHeight < 300) {
                _this.find('.card-body').css('max-height', `300px`);
            }
            else {
                _this.find('.card-body').css('max-height', `${height - imgHeight}px`);
            }

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
    });
});