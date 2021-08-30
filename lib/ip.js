'use strict';

const isIp = require('is-ip');
const ipInt = require('ip-to-int');
const bigInt = require("big-integer");

// takes any valid ipv4 or iov6 address and converts it to an int/big int
exports.numeric = function(ip) {

    let numeric_ip;

    if(! isIp(ip)){
        console.error("ip.numeric - ip is not valid:" + ip) ;
        const error = new Error();
        error.message = "Invalid IP Address included in the request: " + ip;
        error.code = 400;
        return error;
    }


    if(isIp.v4(ip)){
        numeric_ip = ipInt(ip).toInt();
    }
    else{
        // expand ipv6 address
        let fullAddress = "";
        let expandedAddress = "";
        let validGroupCount = 8;
        let validGroupSize = 4;
        let sides = ip.split("::");
        let groupsPresent = 0;
        for(let i=0; i<sides.length; i++)
        {
            groupsPresent += sides[i].split(":").length;
        }
        fullAddress += sides[0] + ":";
        for(let i=0; i<validGroupCount-groupsPresent; i++)
        {
            fullAddress += "0000:";
        }
        fullAddress += sides[1];
        let groups = fullAddress.split(":");
        for(let i=0; i<validGroupCount; i++)
        {
            while(groups[i].length < validGroupSize)
            {
                groups[i] = "0" + groups[i];
            }
            expandedAddress += (i!=validGroupCount-1) ? groups[i] + ":" : groups[i];
        }

        let parts = [];
        expandedAddress.split(":").forEach(function(it) {
            var bin = parseInt(it, 16).toString(2);
            while (bin.length < 16) {
                bin = "0" + bin;
            }
            parts.push(bin);
        })
        let bin = parts.join("");

        // Use BigInteger library
        numeric_ip= bigInt(bin, 2).toString();
    }
    return numeric_ip;
}

