// toast by Joel
/**
 * * Takes in toastMsgs variable from base.handlebars.
 * * toastMsgs variable gets dictionary object,
 * * it can be found it app.js ( Render Engine Global Variable ).
*/
let toast = (function() {
    'use strict';
    let publicFuncs = {};
    
    publicFuncs.init = function() {
        if (typeof toastMsgs !== 'undefined') {
            toastr.options = {
                'closeButton': true,
                'progressBar': true
            }

            Object.keys(toastMsgs).forEach(function(key) {
                if (['info', 'warning', 'success', 'error'].includes(key)) {
                    let _this = toastMsgs[key];
                    for (let i = 0, n = _this.length; i < n; i++) {
                        toastr[key](_this[i]);
                    }
                }
            });
        }
    }

    return publicFuncs;
});