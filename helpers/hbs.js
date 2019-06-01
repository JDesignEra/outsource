const { join } = require('path')
const { readdirSync, lstatSync } = require('fs')
var blocks = {};

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
    setVar: function(varName, varValue, ops) {  //set variable in .handlebars
        if (!ops.data.root) {
            ops.data.root = {};
        }

        ops.data.root[varName] = varValue;
    },
    extend: function(name, context) {
        let block = blocks[name];

        if (!block) {
            block = blocks[name] = [];
        }

        block.push(context.fn(this));
    },
    block: function(name) {
        let val = (blocks[name] || []).join('\n');

        blocks[name] = [];
        return val;
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
    },
    replacecommas: function(components){
        if (components == ''){
            components = 'None';
            return components;
        }
        else{
            components = components.replace(',', ' ');
            return components;
        }
    }
}