'use strict';

exports.isnumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

