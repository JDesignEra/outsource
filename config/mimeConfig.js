const mime = require('mime');

module.exports = {
    init: () => {
        mime.define({ 'code/c': ['c'] }, true);                             // C/C++ Source Code File
        mime.define({ 'code/c++': ['cc', 'cpp'] }, true);                   // C++ Source Code File
        mime.define({ 'code/c#': ['cs'] }, true);                           // C# Source Code File
        mime.define({ 'code/css': ['css'] }, true);                         // CSS Source Code File
        mime.define({ 'code/ecmascript': ['es'] }, true);                   // Emcascript Source Code File
        mime.define({ 'code/handlebars': ['hbs', 'handlebars'] }, true);    // Handlbars Source Code File
        mime.define({ 'code/html': ['html'] }, true);                       // HTML Source Code File
        mime.define({ 'code/java': ['java'] }, true);                       // Java Source Code File
        mime.define({ 'code/javascript': ['js'] }, true);                   // Javascript Source Code File
        mime.define({ 'code/lua': ['lua'] }, true);                         // Lua Source Code File
        mime.define({ 'code/markdown': ['md'] }, true);                     // Markdown Documentation File
        mime.define({ 'code/python': ['py'] }, true);                       // Python Source Code File
        mime.define({ 'code/scss': ['scss'] }, true);                       // Scss Source File
        mime.define({ 'code/swift': ['swift'] }, true);                     // Swift Source Code File
        mime.define({ 'code/twig': ['twig'] }, true);                       // Twig Template
        mime.define({ 'code/xaml': ['xaml'] }, true);                       // XAML Template

        mime.define({ 'document/docx': ['docx'] }, true);                   // Office DocX
    }
}