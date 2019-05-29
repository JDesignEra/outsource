const { join } = require('path')
const { readdirSync, lstatSync } = require('fs')

module.exports = {
    ifEqual: function(a, b, ops) {   // Handlebars if == condition
        if (a == b) {
            return ops.fn(this);
        }
        
        return ops.inverse(this);
    },
    ifNotEqual: function(a, b, ops) {    // Handlebars if != condition
        if (a != b) {
            return ops.fn(this);
        }
        
        return ops.inverse(this);
    },
    partialsDirs: function(p) {     // Handlebars return partials and all folders in partials as array
        let partialsDir = readdirSync(p).filter(f => lstatSync(join(p, f)).isDirectory());
        partialsDir.push(join(p));

        for (let i = 0; i < partialsDir.length - 1; i++) {
            partialsDir[i] = join(p, partialsDir[i]);
        }

        return partialsDir;
    },
    radioCheck: function(value, radioValue){
        if (value === radioValue){
            return 'checked';
        }
        else{
            return '';
        }
    }
}