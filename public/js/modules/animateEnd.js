// Animation End Fix by Joel
let animateEnd = (function() {
    'use strict';
    let publicFuncs = {};

    publicFuncs.init = function() {
        let el = document.createElement('fakeElement');
        
        let animations = {
            "animation": "animationend",
            "OAnimation": "oAnimationEnd",
            "MozAnimation": "mozAnimationEnd",
            "WebkitAnimation": "webkitAnimationEnd"
        };
    
        for (let t in animations) {
            if (el.style[t] !== undefined) {
                return animations[t];
            }
        }
    }

    return publicFuncs;
});