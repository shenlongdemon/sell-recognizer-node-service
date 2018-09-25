var geo = require('spherical-geometry-js');
var geolib  = require('geolib');
var q = require('q');
var _ = require('underscore');
var uuid = require("uuid");
let STRS = ["0123456789", "abcdefghij", "klmnopqrs", "tuvwxyz", "ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ", "-/ _+'.,;:", "[]{}"];
var MAX_DIGIT = 8;
var jsts = require('jsts');

var getCenterOfLocations = function(locations){
    var center = {
        latitude : 0.0,
        longitude : 0.0
    };
    var coords = locations.map(l => {
        return new jsts.geom.Coordinate(l.latitude, l.longitude);
    });
    var geometryFactory = new jsts.geom.GeometryFactory();
    var bound = geometryFactory.createLineString(coords);
    var centroidBound = bound.getCentroid();

    center.latitude = centroidBound.getX();
    center.longitude = centroidBound.getY();

    return center;
}
// circle with latitude, longitude, radius in meter
var getIntersectionFrom2Circles = function(circle1, circle2){
    var geometryFactory = new jsts.geom.GeometryFactory();
    var c1 = geometryFactory.createPoint(new jsts.geom.Coordinate(circle1.latitude, circle1.longitude));
    c1 = c1.buffer(circle1.radius);

    var c2 = geometryFactory.createPoint(new jsts.geom.Coordinate(circle2.latitude, circle2.longitude));
    c2 = c2.buffer(circle2.radius);

    var intersects = c1.intersection(c2).getCoordinates().map(c =>  {return {latitude: c.x, longitude : c.y} ;});
    return intersects;

}
// circle with latitude, longitude, radius in meter
var getCenterOfCircles = function(circles){

    // add first circle to the end to compare last circle with first circle
    circles.push(circles[0]);

    var intersections = [];
    
    for(var i = 0 ; i < circles.length - 1; i++){
        var intersects = getIntersectionFrom2Circles(circles[i], circles[i + 1]);
        Array.prototype.push.apply(intersections, intersects);
    }

    var center = getCenterOfLocations(intersections);
    return center;
}

module.exports =
    {
        getCenterOfCircles : getCenterOfCircles,
        //get_2_Intersection_Locations_Of_2_Circle: get_2_Intersection_Locations_Of_2_Circle,
        //getCenterOf_2_Locations : getCenterOf_2_Locations,
    }

/*
// var getCenter = function (coordsInLatLng) {
//     var latlngs = [];
//     var i = 0;
//      for (i=0; i<coordsInLatLng.length; i++) {
//         var coord = {
//             latitude: coordsInLatLng[i].lat(),
//             longitude: coordsInLatLng[i].lng()
//         };
//         latlngs.push(coord);
//      }
//      var center = geolib.getCenter(latlngs );
//      var coord = {
//         latitude: parseFloat(center.latitude),
//         longitude: parseFloat(center.longitude)
//     };
//      return coord;
// }
// // returm {lat, lon}
// var get_2_Intersection_Locations_Of_2_Circle = function(lat1, lon1, radius1, lat2, lon2, radius2){    

//     var R = 6378137; // m
//     var dLat = ((lat2 - lat1) * Math.PI) / 180;
//     var dLon = ((lon2 - lon1) * Math.PI) / 180;
//     lat1 = lat1 * Math.PI / 180;
//     lat2 = lat2 * Math.PI / 180;
    
//     lon1 = lon1 * Math.PI / 180;
//     lon2 = lon2 * Math.PI / 180;
    
    
//     var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
//     var AC = c / 2;
//     var AB = radius / R;
    
//     var A = Math.acos(Math.tan(AC) * (1 / Math.tan(AB)));
    
//     var y = Math.sin(dLon) * Math.cos(lat2);
//     var x = Math.cos(lat1) * Math.sin(lat2) -
//         Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
//     var brng = Math.atan2(y, x);
    
//     var B_bearing = brng - A;
//     var D_bearing = brng + A;
    
    
    
//     var latSol1 = Math.asin(Math.sin(lat1) * Math.cos(radius / R) +
//                             Math.cos(lat1) * Math.sin(radius / R) * Math.cos(B_bearing));
//     var lonSol1 = lon1 + Math.atan2(Math.sin(B_bearing) * Math.sin(radius / R) * Math.cos(lat1),
//                                     Math.cos(radius / R) - Math.sin(lat1) * Math.sin(lat2));    
    
    
    
//     var latSol2 = Math.asin(Math.sin(lat1) * Math.cos(radius / R) +
//                             Math.cos(lat1) * Math.sin(radius / R) * Math.cos(D_bearing));
//     var lonSol2 = lon1 + Math.atan2(Math.sin(D_bearing) * Math.sin(radius / R) * Math.cos(lat1),
//                                     Math.cos(radius / R) - Math.sin(lat1) * Math.sin(lat2));
     
                                   
//     drawPoint(new google.maps.Point(latSol1 * 180 / Math.PI, lonSol1 * 180 / Math.PI));
//     drawPoint(new google.maps.Point(latSol2 * 180 / Math.PI, lonSol2 * 180 / Math.PI));
// }

// var getCenterOf_2_Locations = function(lat1, lon1, lat2, lon2){
//     var location1 = new geo.LatLng(lat1, lon1);
//     var location2 = new geo.LatLng(lat2, lon2);
//     var coors = [];
//     coors.push(location1);
//     coors.push(location2);
//     var LatLngCenter = getCenter(coors);
//     return {
//         latitude: LatLngCenter.lat(),
//         longitude: LatLngCenter.lng()
//     }
// }
*/