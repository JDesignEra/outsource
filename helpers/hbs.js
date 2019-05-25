module.exports = {
    hbsIfEqual: function(a, b, ops) {
        if (a == b) {
            return ops.fn(this);
        }
        else {
            return ops.inverse(this);
        }
    },
    hbsIfNotEqual: function(a, b, ops) {
        if (a != b) {
            return ops.fn(this);
        }
        else {
            return ops.inverse(this);
        }
    }
}