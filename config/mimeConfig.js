// mimeConfig by Joel
const mime = require('mime');

module.exports = {
    init: () => {
        // Code Files
        mime.define({ 'code/c': ['c'] }, true);                             // C/C++ Code File
        mime.define({ 'code/c++': ['cc', 'cpp'] }, true);                   // C++ Code File
        mime.define({ 'code/c#': ['cs'] }, true);                           // C# Code File
        mime.define({ 'code/css': ['css'] }, true);                         // CSS Code File
        mime.define({ 'code/ecmascript': ['es'] }, true);                   // Emcascript Code File
        mime.define({ 'code/handlebars': ['hbs', 'handlebars'] }, true);    // Handlbars Code File
        mime.define({ 'code/html': ['html'] }, true);                       // HTML Code File
        mime.define({ 'code/java': ['java'] }, true);                       // Java Code File
        mime.define({ 'code/javascript': ['js'] }, true);                   // Javascript Code File
        mime.define({ 'code/lua': ['lua'] }, true);                         // Lua Code File
        mime.define({ 'code/markdown': ['md'] }, true);                     // Markdown Documentation File
        mime.define({ 'code/php': ['php'] }, true);                         // PHP Code File
        mime.define({ 'code/python': ['py'] }, true);                       // Python Code File
        mime.define({ 'code/scss': ['scss'] }, true);                       // Scss Code File
        mime.define({ 'code/sql': ['sql'] }, true);                         // SQL Code File
        mime.define({ 'code/swift': ['swift'] }, true);                     // Swift Code File
        mime.define({ 'code/twig': ['twig'] }, true);                       // Twig Code File
        mime.define({ 'code/xaml': ['xaml'] }, true);                       // XAML Code File
        mime.define({ 'code/xml': ['xml'] }, true);                         // XML Code File

        // Document Files
        mime.define({ 'document/docx': ['docx'] }, true)                    // Microsoft Words File
        mime.define({ 'document/pdf': ['pdf'] }, true)                      // PDF File
        mime.define({ 'document/rtf': ['rtf'] }, true)                      // Rich Text File

        // Application Files
        mime.define({ 'application/vnd.adobe.photoshop': ['psd']}, true)    // Photoshop
    }
}