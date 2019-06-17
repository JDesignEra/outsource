// toast by Joel
let toast = (function() {
    'use strict';
    let publicFuncs = {};
    
    publicFuncs.init = function() {
        if (toastMsgs !== undefined) {
            toastr.options = {
                'closeButton': true,
                'progressBar': true
            }

            if (toastMsgs['info'] !== undefined) {
                if (toastMsgs['info'] instanceof Array) {
                    $(toastMsgs['info']).each(function() {
                        toastr['info'](this);
                    });
                }
                else {
                    toastr['info'](this);
                }
            }

            if (toastMsgs['warning'] !== undefined) {
                if (toastMsgs['warning'] instanceof Array) {
                    $(toastMsgs['warning']).each(function() {
                        toastr['warning'](this);
                    });
                }
                else {
                    toastr['warning'](toastr['warning']);
                }
            }

            if (toastMsgs['success'] !== undefined) {
                if (toastMsgs['success'] instanceof Array) {
                    $(toastMsgs['success']).each(function() {
                        toastr['success'](this);
                    });
                }
                else{
                    toastr['success'](toastMsgs['success']);
                }
            }

            if (toastMsgs['error'] !== undefined) {
                if (toastMsgs['error'] instanceof Array) {
                    $(toastMsgs['error']).each(function() {
                        toastr['error'](this);
                    });
                }
                else {
                    toastr['error'](toastMsgs['error']);
                }
            }
        }
    }

    return publicFuncs;
});