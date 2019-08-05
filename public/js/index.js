// index by Joel
$(function() {
    let cardWrapper = $('.card-wrapper', 'section.home');
    let cardFaces = cardWrapper.find('.face');

    cardFaces.addClass('h-100');

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