// editFiles by Joel
// Editors
$(function() {
    let contentDiv = $('#content');
    let type = contentDiv.attr('data-type');
    let imageEditor = null;

    if (type === 'code' || type === 'text') {
        let editorDiv = contentDiv.find('#editor');
        let input = contentDiv.find('input[name="content"]');

        CodeMirror.modeURL = '/js/vendor/codemirror/mode/%N/%N.js';

        let mode = CodeMirror.findModeByFileName($('#content').attr('data-name')).mode;
        let editor = CodeMirror(editorDiv[0], {
            value: content,
            mode: mode,
            theme: 'one-dark one-light',
            lineNumbers: true,
            gutters: ['CodeMirror-lint-markers'],
            scrollbarStyle: null,
            maxHighlightLength: Infinity,
            viewportMargin: Infinity,
            spellcheck: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lint: mode === 'javascript' ? {esversion: 6} : true
        });

        CodeMirror.commands.autocomplete = function(editor) {
            if (mode === 'xml') {
                CodeMirror.showHint(editor, CodeMirror.hint.html);
            }
            else if (mode === 'javascript') {
                CodeMirror.showHint(editor, CodeMirror.hint.javascript);
            }
            else if (mode === 'css') {
                CodeMirror.showHint(editor, CodeMirror.hint.css);
            }
            else if (mode === 'html') {
                CodeMirror.showHint(editor, CodeMirror.hint.html);
            }
            else if (mode === 'sql') {
                CodeMirror.showHint(editor, CodeMirror.hint.sql);
            }
            else if (mode === 'python') {
                CodeMirror.showHint(editor, CodeMirror.hint.python);
            }
            else {
                CodeMirror.showHint(editor, CodeMirror.hint.auto);
            }
        };

        CodeMirror.autoLoadMode(editor, mode);
        
        setTimeout(function() {
            $('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
            
            clearTimeout(this);
        }, 500);

        let cm = editorDiv.find('.CodeMirror');
        cm.addClass('rounded');

        data = undefined;
        $('script#data').remove();

        input.val(editor.getValue());

        editor.on('change', cm => {
            $('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
            
            input.val(cm.getValue());
        });

        editor.on('keyup', (cm, e) => {
            let ignoreKey = [8, 9, 13, 17, 18, 19, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 145];

            if (ignoreKey.indexOf(e.keyCode) === -1) {
                cm.execCommand('autocomplete');
            }
        });
    }
    else if (type === 'image') {
        let focus = $('#editor', '#content');
        let path = `${focus.attr('data-link')}`;
        let name = focus.parent('#content').attr('data-name');
        let height = $(window).width() < 768 ? '600px' : '800px';

        imageEditor = new tui.ImageEditor('#content > #editor', {
            includeUI: {
                loadImage: {
                    path: path,
                    name: name
                },
                theme: blackTheme,
                initMenu: 'filter',
                uiSize: {
                    height: height
                },
                menuBarPosition: 'bottom'
            },
            selectionStyle: {
                cornerSize: 20,
                rotatingPointOffset: 70
            },
            usageStatistics: false
        });

        $(window).on('resize', function() {
            if ($(window).width() < 768) {
                imageEditor.ui.resizeEditor({
                    uiSize: {
                        height: '600px'
                    }
                });
            }
            else {
                imageEditor.ui.resizeEditor({
                    uiSize: {
                        height: '800px'
                    }
                });
            }
        });
    }

    // Save Action
    let saveAction = $('.list-group, #mobile-action-menu', '#action-card, #mobile-action').find('.save');

    saveAction.on('click', function() {
        let contentDiv = $('#content')
        let type = contentDiv.attr('data-type');
        let form = contentDiv.find('form');
        
        if (type === 'code' || type === 'text') {
            form.submit();
        }
        else if (type === 'image' && imageEditor !== null) {
            form.find('input[name="content"]').val(imageEditor.toDataURL());
            form.submit();
        }
    });
});

// Action-Card
$(function() {
    let focus = $('.list-group, #mobile-action-menu', '#action-card, #mobile-action');

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