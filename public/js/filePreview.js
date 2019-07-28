// filePreview by Joel
// Action-Card
$(function() {
    let focus = $('.list-group, #mobile-action-menu', '#action-card, #mobile-action');

    // Download Link
    let downloadAction = focus.find('.download');
    downloadAction.attr('href', `${window.location.pathname.replace(/\/~preview/gi, '')}/~download`);

    // Edit Link
    let editAction = focus.find('.edit');
    editAction.attr('href', `${window.location.pathname}/~edit`);

    // Editor Theme Mode
    let editorModeAction = focus.find('.editor-mode');

    editorModeAction.on('click', function() {
        let _this = $(this);
        let mode = _this.attr('data-mode');
        let stylesheet = $('#editor-style', 'head');
        let stylesheetHref = stylesheet.attr('href');
        
        if (mode === 'light') {
            stylesheetHref = stylesheetHref.replace(/\/one-light.css/gi, '/one-dark.css');
            stylesheet.attr('href', stylesheetHref);

            _this.attr('data-mode', 'dark');
            _this.html('<i class="far fa-adjust mr-1"></i>Light Mode');
        }
        else {
            stylesheetHref = stylesheetHref.replace(/\/one-dark.css/gi, '/one-light.css');
            stylesheet.attr('href', stylesheetHref);

            _this.attr('data-mode', 'light');
            _this.html('<i class="far fa-adjust mr-1"></i>Dark Mode');
        }
    });
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

// Code Syntax Highlight
$(function() {
    let type = $('#content').attr('data-type');

    if (type === 'code') {
        CodeMirror.modeURL = '/js/vendor/codemirror/mode/%N/%N.js';

        let mode = CodeMirror.findModeByFileName($('#editor', '#content').attr('data-name')).mode;
        let editor = CodeMirror($('#editor', '#content')[0], {
            value: content,
            mode: mode,
            theme: 'one-dark one-light',
            lineNumbers: true,
            readOnly: true,
            scrollbarStyle: null,
            maxHighlightLength: Infinity,
            viewportMargin: Infinity,
            spellcheck: true,
            matchBrackets: true,
        });

        CodeMirror.autoLoadMode(editor, mode);

        setTimeout(function() {
            $('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
            
            clearTimeout(this);
        }, 500);

        let cm = $('#editor', '#content').find('.CodeMirror');
        cm.addClass('rounded');

        data = undefined;
        $('script#data').remove();
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