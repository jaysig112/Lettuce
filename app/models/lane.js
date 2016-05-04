'use strict';
var mongoose    = require('mongoose');
var logger = require('../utilities/logger');
var q = require('q');

//Set up a mongoose model

var Lane = mongoose.model('Lane', {
    name: String,
    compID: String,
    championNameFilter: String
});


var methods = {
    create:function(name, compID){
        var deferred  = q.defer();      
        Lane.create({
            name: name,
            compID: compID
        }, function(err, lane){
            if(err){
                logger.error(err);
                deferred.reject(err);
                return;
            }
            logger.debug('Created Lane: ' + name);
            deferred.resolve(lane.toObject());
        });
        return deferred.promise;            
    },
    get: function(laneID){
        var deferred = q.defer();
        Lane.findOne({
            _id: laneID
        }).lean().exec(function(err, lane){
            if(err){
                logger.error(err);
                deferred.reject(err);
            } 
            deferred.resolve(lane); //only return ONE NO
        });
        return deferred.promise;
    },
    getByCompID: function(compID){
        var deferred = q.defer();
        Lane.find({
            compID: compID
        }).lean().exec(function(err, lanes){
            if(err){
                logger.error(err);
                deferred.reject(err);
            } 
            deferred.resolve(lanes); 
        });
        return deferred.promise;
    }
};


module.exports = {
    create: methods.create,
    get: methods.get,
    getByCompID: methods.getByCompID
};