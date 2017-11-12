/*'use strict';*/

var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');
var handleError = require('hapi-error').handleError; // libraries.io/npm/hapi-error

var SocketIO = require('socket.io');
var io;

// please see: .
function sanitise (text) {
  var sanitised_text = text;

  /* istanbul ignore else */
  if (text.indexOf('<') > -1 /* istanbul ignore next */
     || text.indexOf('>') > -1) {
    sanitised_text = text.replace(/</g, '&lt').replace(/>/g, '&gt');
  }

  return sanitised_text;
}


function chatHandler (socket) {
  //when user chooses board size
  socket.on('io:pickboard',function(size){
    //io.sockets.emit('game:boards:latest', size);
    //console.log(socket.client.conn.id + " > " + size + '  board chosen!');
    //pub.hset('boardsize', socket.client.conn.id, size);
    //pub.publish('game:boardsize:new', data);
    pub.hget('people', socket.client.conn.id, function (error, name) {
      // see: https://github.com/dwyl/hapi-error#handleerror-everywhere
      handleError(error, 'Error retrieving '
        + socket.client.conn.id + ' from Redis :-( for boardsize: ' +  size);
    //console.log("pickboard received: " + size + " | from: " + name);
      mv = JSON.stringify({ // store each move as a JSON object
        d: size,
        t: new Date().getTime(),
        n: name
      });
      pub.rpush('game:boards', mv);   // game history
      pub.publish('game:boards:latest', mv);  // latest move
    });
  });

  // socket.on('io:choseSquare',function(squareNumber){
  //   //io.sockets.emit('game:boards:latest', size);
  //   //console.log(socket.client.conn.id + " > " + size + '  board chosen!');
  //   //pub.hset('boardsize', socket.client.conn.id, size);
  //   //pub.publish('game:boardsize:new', data);
  //   pub.hget('people', socket.client.conn.id, function (error, name) {
  //     // see: https://github.com/dwyl/hapi-error#handleerror-everywhere
  //     handleError(error, 'Error retrieving '
  //       + socket.client.conn.id + ' from Redis :-( for boardsize: ' +  size);
  //   //console.log("pickboard received: " + size + " | from: " + name);
  //     mv = JSON.stringify({ // store each move as a JSON object
  //       d: squareNumber,
  //       t: new Date().getTime(),
  //       n: name
  //     });
  //     pub.rpush('game:boards', mv);   // game history
  //     pub.publish('game:boards:latest', mv);  // latest move
  //   });
  // });

  socket.on('io:clearboard', function(){
    //io.sockets.emit('game:boards:latest', 0);
    //pub.hset('boardsize', socket.client.conn.id, 0);
    pub.hget('people', socket.client.conn.id, function (error, name) {
    mv = JSON.stringify({
        d: null,
        t: new Date().getTime(),
        n: name
    });//load an null size game over the current game
    pub.rpush('game:boards', mv);//erase the history
    console.log('erase success');
    pub.publish('game:boards:latest', mv);//erase the latest board

    //record in message log
    str = JSON.stringify({ // store each message as a JSON object
        m: 'chose new game',
        t: new Date().getTime(),
        n: name
    });
    pub.rpush('chat:messages', str);   // chat history
    pub.publish('chat:messages:latest', str);  // latest message

    });
  });


  // welcome new clients
  socket.emit('io:welcome', 'hi!');

  socket.on('io:name', function (name) {
    pub.hset('people', socket.client.conn.id, name);
    // console.log(socket.client.conn.id + " > " + name + ' joined chat!');
    pub.publish('chat:people:new', name);
  });

  socket.on('io:message', function (msg) {
    // console.log('msg:', msg);
    var sanitised_message = sanitise(msg);
    var str;

    pub.hget('people', socket.client.conn.id, function (error, name) {
      // see: https://github.com/dwyl/hapi-error#handleerror-everywhere
      handleError(error, 'Error retrieving '
        + socket.client.conn.id + ' from Redis :-( for: ' + sanitised_message);
      // console.log("io:message received: " + msg + " | from: " + name);
      str = JSON.stringify({ // store each message as a JSON object
        m: sanitised_message,
        t: new Date().getTime(),
        n: name
      });

      pub.rpush('chat:messages', str);   // chat history
      pub.publish('chat:messages:latest', str);  // latest message
    });
  });

  /* istanbul ignore next */
  socket.on('error', function (error) {
    handleError(error, error.stack);
  });
  // how should we TEST socket.io error? (suggestions please!)
}


/**
 * chat is our Public interface
 * @param {object} listener [required] - the http/hapi server object.
 * @param {function} callback - called once the socket server is running.
 * @returns {function} - returns the callback after 300ms (ample boot time)
 */
function init (listener, callback) {
  // setup redis pub/sub independently of any socket.io connections
  pub.on('ready', function () {
    // console.log("PUB Ready!");
    sub.on('ready', function () {
      sub.subscribe('chat:messages:latest', 'chat:people:new', 'game:boards:latest');
      // now start the socket.io
      io = SocketIO.listen(listener);
      io.on('connection', chatHandler);
      // Here's where all Redis messages get relayed to Socket.io clients
      sub.on('message', function (channel, message) {
        // console.log(channel + ' : ' + message);
        io.emit(channel, message); // relay to all connected socket.io clients
      });
      sub.on('pickboard', function (channel, pickboard) {
        console.log(channel + ' : ' + pickboard);
        io.emit(channel, pickboard); // relay to all connected socket.io clients
      });
      // sub.on('choseSquare', function (channel, choseSquare) {
      //   console.log(channel + ' : ' + choseSquare);
      //   io.emit(channel, choseSquare); // relay to all connected socket.io clients
      // });


      return setTimeout(function () {
        return callback();
      }, 300); // wait for socket to boot
    });
  });
}

module.exports = {
  init: init,
  pub: pub,
  sub: sub
};
