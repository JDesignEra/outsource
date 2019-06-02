const { join } = require('path')
const { readdirSync, lstatSync } = require('fs')
const moment = require('./moment');
let blocks = {};
let blocksFlag = {};

module.exports = {
    currYear: moment.format(new Date, 'YYYY'),
    ifCond (expression, ops) {
        var result;
        var context = this;

        with(context) {
            result = (function() {
                try {
                    return eval(expression);
                }
                catch (e) {
                    if (e instanceof ReferenceError) {
                        return false;
                    }
                    else {
                        console.warn('•Expression: {{ifCond \'' + expression + '\'}}\n•JS-Error: ', e, '\n•Context: ', context);
                    }
                }
            }).call(context);
        }

        console.log(expression + ': ' + result);
        return result ? ops.fn(this) : ops.inverse(this);
    },
    setVar: function(varName, varValue, ops) {  //set variable in .handlebars
        if (!ops.data.root) {
            ops.data.root = {};
        }

        ops.data.root[varName] = varValue;
    },
    extend: function(name, ops) {
        let block = blocks[name];

        if (!block) {
            block = blocks[name] = [];
        }
        
        blocksFlag[name] = true;
        block.push(ops.fn(this));
    },
    block: function(name) {
        let val = (blocks[name] || []).join('\n');

        blocks[name] = [];
        return val;
    },
    ifBlock(name, ops) {
        let flag = (blocksFlag[name] ? false : true);
        console.log(name + ': ' + flag);
        
        blocksFlag[name] = false
        
        
        return (flag) ? ops.fn(this) : ops.inverse(this);
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