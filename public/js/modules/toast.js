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
            Object.keys(toastMsgs).forEach((key) => {
                let _this = toastMsgs[key];
                
                if (['info', 'warning', 'success', 'error'].includes(key)) {
                    for (let i = 0, n = _this.length; i < n; i++) {
                        let obj = _this[i];

                        if (typeof obj === 'object' && obj instanceof Object) {
                            let timeOut = 2500;
                            let extendedTimeOut = 1250;

                            if (!obj['autoHide']) {
                                timeOut = 0;
                                extendedTimeOut = 0;
                            }

                            toastr.options = {
                                'closeButton': true,
                                'progressBar': true,
                                'newestOnTop': true,
                                'hideDuration': 300,
                                'timeOut': timeOut,
                                'extendedTimeOut': extendedTimeOut
                            }[key](_this[i]);
                        }
                        else {
                            toastr.options = {
                                'closeButton': true,
                                'progressBar': true,
                                'newestOnTop': true,
                                'hideDuration': 300,
                                'timeOut': 2500,
                                'extendedTimeOut': 1250,
                            }[key](obj);
                        }
                    }
                }
            });

            toastMsgs = undefined;
            $('script#toast-script').remove();
        }
    }

    return publicFuncs;
});