// filePreview by Joel
// Action-Card
$(function() {
    let focus = $('.list-group, #mobile-action-menu', '#action-card, #mobile-action');

    // Download Link
    let downloadAction = focus.find('.download');
    downloadAction.attr('href', `${window.location.pathname.replace(/\/~preview/gi, '')}/~download`);

    // Editor Theme Mode
    let editorModeAction = focus.find('.editor-mode');

    editorModeAction.on('click', function() {
        let _this = $(this);
        let mode = _this.attr('data-mode');
        let stylesheet = $('#editor-style', 'head');
        let stylesheetHref = stylesheet.attr('href');
        
        if (mode === 'light') {
            stylesheetHref = stylesheetHref.replace(/\/atom-one-light.css/gi, '/atom-one-dark.css');
            stylesheet.attr('href', stylesheetHref);

            _this.attr('data-mode', 'dark');
            _this.html('<i class="far fa-adjust mr-1"></i>Light Mode');
        }
        else {
            stylesheetHref = stylesheetHref.replace(/\/atom-one-dark.css/gi, '/atom-one-light.css');
            stylesheet.attr('href', stylesheetHref);

            _this.attr('data-mode', 'light');
            _this.html('<i class="far fa-adjust mr-1"></i>Dark Mode');
        }
    });
});

// Code Syntax Highlight
$(function() {
    let focus = $('#content');

    // Code Block
    let codeBlock = focus.find('pre code');
    let ext = codeBlock.attr('data-ext');
    
    if (hljs.getLanguage(ext) === undefined) {
        codeBlock.addClass('code plaintext');
    }

    hljs.initHighlighting();
});

// Mobile-Action
$(function() {
    let focus = $('#mobile-action');

    if (focus.length > 0) {
        let toTopAction = $('#to-top-action');

        $(window).on('resize', function() {
            if ($(window).width() < 768) {
                if (!toTopAction.hasClass('invisible')) {
                    toTopAction.addClass('invisible');
                }
            }
            else {
                if (toTopAction.hasClass('invisible')) {
                    toTopAction.removeClass('invisible');
                }
            }
        });
    
        $(window).scroll(function() {
            if (focus.offset().top - 47 > $('main').height()) {
                focus.css('bottom', '40px');
            }
            else {
                focus.css('bottom', '5px');
            }
        });
    
        $(window).trigger('resize');
    }
});

// Show Modal & Replace URL Without Redirecting
$(function() {
    let url = window.location.href;
    
    if (url.indexOf('/~comments') > -1) {
        history.replaceState(null, null, url.replace(/\/~comments/gi, ''));
        $('#comments-modal').modal('show');
    }
});