// toast by Joel
/**
 * * Takes in toastMsgs variable from base.handlebars.
 * * toastMsgs variable is a dictionary object.
*/
let toast = (function() {
    'use strict';
    let publicFuncs = {};
    
    publicFuncs.init = function() {
        if (typeof toastMsgs !== 'undefined') {
            toastr.options = {
                'closeButton': true,
                'progressBar': true,
                'newestOnTop': true,
                'extendedTimeOut': 0,
                'hideDuration': 300,
                'timeOut': 2000,
                'extendedTimeOut': 1000,
            }

            Object.keys(toastMsgs).forEach(function(key) {
                _this = toastMsgs[key];

                if (['info', 'warning', 'success', 'error'].includes(key)) {
                    for (let i = 0, n = _this.length; i < n; i++) {
                        toastr[key](_this[i]);
                    }
                }
            });
        }
    }

    return publicFuncs;
});