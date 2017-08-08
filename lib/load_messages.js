'use strict';

var redisClient = require('redis-connection')();
var handleError = require('hapi-error').handleError;

function loadMessages (req, reply) {
  redisClient.lrange('chat:messages', 0, -1, function (error, data) {
    handleError(error, error);

    return reply(data);
  });
}

function loadGame (req, reply) {
  redisClient.lrange('game:boards', 0, -1, function (error, size) {
    handleError(error, error);

    return reply(size);
  });
}

module.exports = {
  load: loadMessages,
  loadGame: loadGame,
  redisClient: redisClient
};
