// hbs (Handlebars Helpers) by Joel
const { join } = require('path')
const { readdirSync, lstatSync, existsSync } = require('fs')
const moment = require('./moment');

let blocks = {};
let blocksFlag = {};

module.exports = {
    block: function (name) {
        let val = (blocks[name] || []).join('\n');

        blocks[name] = [];
        return val;
    },
    concat: function () {
        let out = '';

        for (let arg in arguments) {
            if (typeof arguments[arg] !== 'object') {
                out += arguments[arg];
            }
        }

        return out;
    },
    currYear: function () {
        return moment.format(new Date, 'YYYY')
    },
    extend: function (name, ops) {
        let block = blocks[name];

        if (!block) {
            block = blocks[name] = [];
        }

        blocksFlag[name] = true;
        block.push(ops.fn(this));
    },
    ifCond: function (expression, ops) {
        let result;
        let context = this;

        with (context) {
            result = (function () {
                try {
                    return eval(expression);
                }
                catch (e) {
                    if (e instanceof ReferenceError) {
                        return false;
                    }
                    else {
                        console.warn('Expression: {{ifCond \'' + expression + '\'}}\nJS-Error: ', e, '\nContext: ', context);
                    }
                }
            }).call(context);
        }

        return result ? ops.fn(this) : ops.inverse(this);
    },
    ifExtend: function (name, ops) {
        let flag = (blocksFlag[name] !== undefined ? blocksFlag[name] : false);
        blocksFlag[name] = false;

        return (flag) ? ops.fn(this) : ops.inverse(this);
    },
    ifNotExtend: function (name, ops) {
        let flag = (blocksFlag[name] !== undefined ? !blocksFlag[name] : true);
        blocksFlag[name] = false;

        return (flag) ? ops.fn(this) : ops.inverse(this);
    },
    ifFile: function (path, ops) {
        return existsSync(path) ? ops.fn(this) : ops.inverse(this);
    },
    ifStringContain: function (string, contains, ops) {
        return string.indexOf(contains) > -1 ? ops.fn(this) : ops.inverse(this);
    },
    json: function (object) {
        return JSON.stringify(object);
    },
    joinSeperator: function (seperator, ...args) {
        let out = '';

        for (let arg in args) {
            if (Object.getPrototypeOf(args[arg]) !== Object.prototype) {
                if (typeof args[arg] !== 'object') {
                    out += args[arg] + seperator;
                }
                else {
                    for (let key in args[arg]) {
                        out += args[arg][key] + seperator;
                    }
                }
            }
        }

        return out.slice(0, -seperator.length);
    },
    setVar: function (varName, varValue, ops) {
        if (!ops.data.root) {
            ops.data.root = {};
        }

        ops.data.root[varName] = varValue;
    },
    partialsDirs: function (p) {     // Handlebars return partials and all folders in partials as array
        let partialsDir = readdirSync(p).filter(f => lstatSync(join(p, f)).isDirectory());
        partialsDir.push(join(p));

        for (let i = 0, n = partialsDir.length; i < n - 1; i++) {
            partialsDir[i] = join(p, partialsDir[i]);
        }

        return partialsDir;
    },
    /* Joshua */
    radioCheck: function (value, radioValue) {
        if (value.includes(radioValue)) {
            return 'checked';
        }
        else {
            return '';
        }
    },
    replacecommas: function (components) {
        if (components == '') {
            components = 'None';
            return components;
        }
        else {
            components = components.replace(',', ' ');
            return components;
        }
    },
    //Lemuel
    formatDate: function (date, targetFormat) {
        return moment.format(date, targetFormat);
    },
}