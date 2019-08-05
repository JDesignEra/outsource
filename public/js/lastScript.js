// init lazyload
$(function () {
    if ($('img').length > 0) {
        lazyload().init();
    }
});