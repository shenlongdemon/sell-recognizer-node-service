var geo = require('spherical-geometry-js');
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var MAX_DIGIT = 8;
function convertToNum(string) {
    var code = "";
    Array.from(string).map((c, key) => {
        try {
            _.map(STRS, function (STR, index) {
                var idx = STR.indexOf(c);
                if (idx > -1) {
                    code += index + "" + idx;
                }
            });
        } catch (e) {
            console.log("convertToNum Error " + e);
        }
    });
    return code;
}
function getMAXString(string) {
    try {
        var str = string.length > MAX_DIGIT ? string.substr(0, MAX_DIGIT - 1) : string;
        return str;
    } catch (e) {
        console.log("getMAXString Error " + e);
        return "";
    }
}
function genInfoCode(action, owner) {

    var allStr = " " + action + " " + owner.firstName + " " + owner.lastName + " " + owner.state + " " + owner.zipCode + " " + owner.country
        + "[" + owner.position.coord.latitude + "," + owner.position.coord.longitude + " " + owner.position.coord.altitude + "] "
        + owner.weather.main.temp + "C" + " " + owner.time;
    var code = convertToNum(allStr);
    return code;

}

var area = function (coord) {
    var area = 0,
        i,
        j,
        point1,
        point2;

    for (i = 0, j = coord.length - 1; i < coord.length; j=i,i++) {
        point1 = coord[i];
        point2 = coord[j];
        area += point1.lat() * point2.lng();
        area -= point1.lng() * point2.lat();
    }
    area /= 2;

    return area;
};
var getCenter = function (coord) {
    var x = 0,
            y = 0,
            i,
            j,
            f,
            point1,
            point2;

        for (i = 0, j = coord.length - 1; i < coord.length; j=i,i++) {
            point1 = coord[i];
            point2 = coord[j];
            f = point1.lat() * point2.lng() - point2.lat() * point1.lng();
            x += (point1.lat() + point2.lat()) * f;
            y += (point1.lng() + point2.lng()) * f;
        }

        f = area(coord) * 6;
        var res = {
            latitude: x / f,
            longitude: y / f
        };
        return res;
}
// function returnIntersectionArea(point1, point2, point3, r1, r2, r3) {

//     // determine bounding rectangle
//     var left   = Math.min(point1.x - r1, point2.x - r2, point3.x - r3);
//     var right  = Math.max(point1.x + r1, point2.x + r2, point3.x + r3);
//     var top    = Math.min(point1.y - r1, point2.y - r2, point3.y - r3);
//     var bottom = Math.max(point1.y + r1, point2.y + r2, point3.y + r3);

//     // area of bounding rectangle
//     var rectArea = (right - left) * (bottom - top);

//     var iterations = 10000;
//     var pts = 0;
//     var i = 0;
//     for (i=0; i<iterations; i++) {

//       // random point coordinates
//       var x = left + Math.rand() * (right - left);
//       var y = top  + Math.rand() * (bottom - top);

//           // check if it is inside all the three circles (the intersecting area)
//       if (Math.sqrt(Math.pow(x - point1.x, 2) + Math.pow(y - point1.y, 2)) <= r1 &&
//           Math.sqrt(Math.pow(x - point2.x, 2) + Math.pow(y - point2.y, 2)) <= r2 &&
//           Math.sqrt(Math.pow(x - point3.x, 2) + Math.pow(y - point3.y, 2)) <= r3)
//         pts++;
//     }

//     // the ratio of points inside the intersecting area will converge to the ratio
//     // of the area of the bounding rectangle and the intersection
//     return pts / iterations * rectArea;
//   }
function genItemCode(item) {
    var category = getMAXString(item.category.value);
    var name = getMAXString(item.name);

    var allStr = category + " " + name;
    var code = convertToNum(allStr);
    return code;

}
var dateLong = function () {
    var d = new Date();
    var n = d.getTime();
    return n;
};
var getIntersections = function (latA, lngA, rA, latB, lngB, rB) {
    /* 
     * Find the points of intersection of two google maps circles or equal radius
     * circleA: a google.maps.Circle object 
     * circleB: a google.maps.Circle object
     * returns: null if 
     *    the two radii are not equal 
     *    the two circles are coincident
     *    the two circles don't intersect
     * otherwise returns: array containing the two points of intersection of circleA and circleB
     */

    var R, centerA, centerB, D, h, h_;

    try {

        R = rA;
        centerA = new geo.LatLng(parseFloat(latA), parseFloat(lngA));
        centerB = new geo.LatLng(parseFloat(latB), parseFloat(lngB));

        // if (R !== rB) {
        //     return [];
        // }
        if (centerA.equals(centerB)) {
             return [];
        }

        D = geo.computeDistanceBetween(centerA, centerB); //Distance between the two centres (in meters)

        // Check that the two circles intersect
        if (D > (2 * R)) {
            return [];
        }

        h = geo.computeHeading(centerA, centerB); //Heading from centre of circle A to centre of circle B. (in degrees)
        h_ = Math.acos(D / 2 / R) * 180 / Math.PI; //Included angle between the intersections (for either of the two circles) (in degrees). This is trivial only because the two radii are equal.

        //Return an array containing the two points of intersection as google.maps.latLng objects
        return [
            geo.computeOffset(centerA, R, h + h_),
            geo.computeOffset(centerA, R, h - h_)
        ];
    }
    catch (e) {
        console.error("getIntersections() :: " + e.message);
        return [];
    }
};
var convertStringToNumWithDescription = function (str) {
    var code = "";
    var description = ""
    Array.from(str).map((c, key) => {

        _.map(STRS, function (STR, index) {
            var idx = STR.indexOf(c);
            if (idx > -1) {
                code += index + "" + idx;
                description += c;
            }
        });

    });
    var res = {
        code: code,
        str: description
    }
    return res;
};
var restartItem = function (action, item) {

    var itemCode = genItemCode(item);
    var ownerCode = genInfoCode(action, item.owner)
    item.code = itemCode + ownerCode;
    item.owner.code = ownerCode;
    item.section = item.section || { active: true, code: "", history: [] };
    item.section.history = item.section.history || [];
    item.section.history.push(item.owner);
    item.buyerCode = "";
    item.sellCode = "";
    item.buyer = undefined;
    item.use = "";
};
var getDistance = function (fromCoord, toCoord) {
    var loc1 = new geo.LatLng(parseFloat(fromCoord.latitude), parseFloat(fromCoord.longitude));
    var loc2 = new geo.LatLng(parseFloat(toCoord.latitude), parseFloat(toCoord.longitude));
    var EarthRadiusMeters = 6378137.0; // meters
    var lat1 = loc1.lat();
    var lon1 = loc1.lng();
    var lat2 = loc2.lat();
    var lon2 = loc2.lng();
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = EarthRadiusMeters * c;
    return d;

};
var getDegree = function (from, to) {
    var lat1 = from.lat() * Math.PI / 180;
    var lat2 = to.lat() * Math.PI / 180;
    var dLon = (to.lng() - from.lng()) * Math.PI / 180;

    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    var brng = Math.atan2(y, x);

    var degree = (((brng * 180 / Math.PI) + 360) % 360);
    return degree;
};
var getTransitivityCoordinate = function (fromCoord, toCoord, distance) {
    var from = new geo.LatLng(parseFloat(fromCoord.latitude), parseFloat(fromCoord.longitude));
    var to = new geo.LatLng(parseFloat(toCoord.latitude), parseFloat(toCoord.longitude));
    var degree = getDegree(from, to);

    var F = new geo.LatLng(from.lat(), from.lng());

    var A = geo.computeOffset(F, parseFloat(distance), degree);
    var coord = {
        latitude: A.lat(),
        longitude: A.lng()
    };
    return coord;
};
module.exports =
    {
        dateLong: dateLong,
        convertStringToNumWithDescription: convertStringToNumWithDescription,
        restartItem: restartItem,
        getTransitivityCoordinate: getTransitivityCoordinate,
        getDistance: getDistance,
        getIntersections: getIntersections,
        getCenter: getCenter,
    }