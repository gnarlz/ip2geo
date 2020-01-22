'use strict';

const isIp = require('is-ip');
const ipInt = require('ip-to-int');
const bigInt = require("big-integer");

exports.numeric = function(ip) {

    let numeric_ip;

    if(isIp.v4(ip)){
        numeric_ip = ipInt(ip).toInt();
    }
    else{
        // expand ipv6 address
        var fullAddress = "";
        var expandedAddress = "";
        var validGroupCount = 8;
        var validGroupSize = 4;
        var sides = ip.split("::");
        var groupsPresent = 0;
        for(var i=0; i<sides.length; i++)
        {
            groupsPresent += sides[i].split(":").length;
        }
        fullAddress += sides[0] + ":";
        for(var i=0; i<validGroupCount-groupsPresent; i++)
        {
            fullAddress += "0000:";
        }
        fullAddress += sides[1];
        var groups = fullAddress.split(":");
        for(var i=0; i<validGroupCount; i++)
        {
            while(groups[i].length < validGroupSize)
            {
                groups[i] = "0" + groups[i];
            }
            expandedAddress += (i!=validGroupCount-1) ? groups[i] + ":" : groups[i];
        }

        var parts = [];
        expandedAddress.split(":").forEach(function(it) {
            var bin = parseInt(it, 16).toString(2);
            while (bin.length < 16) {
                bin = "0" + bin;
            }
            parts.push(bin);
        })
        var bin = parts.join("");

        // Use BigInteger library
        numeric_ip= bigInt(bin, 2).toString();
    }

    //console.log("ip.numeric: numeric_ip: " + numeric_ip);
    return numeric_ip;
}

