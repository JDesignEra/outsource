const { join } = require('path')
const { readdirSync, lstatSync } = require('fs')

module.exports = {
    hbsIfEqual: function(a, b, ops) {   // Handlebars if == condition
        if (a == b) {
            return ops.fn(this);
        }
        
        return ops.inverse(this);
    },
    hbsIfNotEqual: function(a, b, ops) {    // Handlebars if != condition
        if (a != b) {
            return ops.fn(this);
        }
        
        return ops.inverse(this);
    },
    partialsDirs: function(p) {     // Handlebars return partials and all folder in partials as array
        let partialsDir = readdirSync(p).filter(f => lstatSync(join(p, f)).isDirectory());
        partialsDir.push(join(p));

        for (let i = 0; i < partialsDir.length - 1; i++) {
            partialsDir[i] = join(p, partialsDir[i]);
        }

        return partialsDir;
    }
}