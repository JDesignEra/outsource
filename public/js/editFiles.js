// editFiles by Joel
// Code Editor
$(function() {
    let contentDiv = $('#content');
    let type = contentDiv.attr('data-type');

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
            scrollbarStyle: null,
            maxHighlightLength: Infinity,
            viewportMargin: Infinity,
            spellcheck: true,
            matchBrackets: true,
            autoCloseBrackets: true,
        });

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
    }
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

    // Save Action
    let saveAction = focus.find('.save');

    saveAction.on('click', function() {
        let form = $('#content').find('form');
        form.submit();
    });
});


// // Code Rich Text Editor
// if ($('#content').attr('data-type') === 'code') {
//     FroalaEditor.ICON_TEMPLATES = {
//         far: '<i class="far fa-[FA5NAME]"></i>',
//         fas: '<i class="fas fa-[FA5NAME]"></i>'
//     }

//     FroalaEditor.DefineIcon('save', {NAME: 'save', template: 'far'});
//     FroalaEditor.DefineIcon('times', {NAME: 'times', template: 'far'});
//     FroalaEditor.DefineIcon('undo', {NAME: 'undo-alt', template: 'far'});
//     FroalaEditor.DefineIcon('redo', {NAME: 'redo-alt', template: 'far'});
    
//     FroalaEditor.RegisterCommand('save', {
//         title: 'Save',
//         icon: 'save',
//         focus: true,
//         refreshAfterCallback: true,
//         callback: function () {
//             let html = this.html.get();
//             html = html.replace(/&nbsp;/gi, ' ');
//             html = html.replace(/<div>/gi, '');
//             html = html.replace(/<\/div>/gi, '\n');
//             html = html.slice(0, html.indexOf('<p data-f-id="pbf"'))

//             $('input[name="content"]', '#content').val(html);
//             this.events.focus();

//             console.log($('input[name="content"]', '#content').val());
//         }
//     });
    
//     FroalaEditor.RegisterCommand('clear', {
//         title: 'Clear',
//         icon: 'times',
//         focus: true,
//         undo: true,
//         refreshAfterCallback: true,
//         callback: function () {
//             this.html.set('');
//             this.events.focus();
//         }
//     });
    
//     new FroalaEditor('#editor', {
//         toolbarButtons: [['save', 'clear'], ['undo', 'redo']],
//         shortcutsEnabled: ['undo', 'redo'],
//         tabSpaces: 4,
//         enter: FroalaEditor.ENTER_DIV,
//         quickInsertEnabled: false
//     });

//     $(function() {
//         $('a:contains("Unlicensed copy of the Froala Editor. Use it legally by purchasing a license.")', '#editor').parent().addClass('d-none');
//         $('.second-toolbar a#logo', '#editor').addClass('d-none');
//         $('.fr-placeholder', '#editor').addClass('mt-0');
    
//         $('.fr-wrapper', '#editor').on('DOMNodeInserted', function() {
//             $('a:contains("Unlicensed copy of the Froala Editor. Use it legally by purchasing a license.")', '#editor').parent().addClass('d-none');
//             $('.fr-wrapper::after').css('display', 'none');
//         });
    
//         $('.fr-element.fr-view').on('keydown', function(e) {
//             if (e.ctrlKey && (e.which === 66)) {
//                 return false;
//             }
    
//             if (e.ctrlKey && (e.which === 85)) {
//                 return false;
//             }
    
//             if (e.ctrlKey && (e.which === 73)) {
//                 return false;
//             }
//         });
//     });

//     // Code Syntax Highlight
//     $(function() {
//         let focus = $('#content');

//         // Code Block
//         let codeBlock = focus.find('.fr-element.fr-view div');
//         let ext = focus.attr('data-ext');
        
//         if (hljs.getLanguage(ext) === undefined) {
//             codeBlock.addClass('hljs plaintext');
//         }
//         else {
//             codeBlock.addClass(`hljs ${ext}`)
//         }

//         hljs.initHighlighting();
//     });
// }