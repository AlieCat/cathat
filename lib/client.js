/*'use strict';*/

 /* global $ io Cookies */

$(document).ready(function () {
  var socket = io(); // initialise socket.io connection

  function getName () {
    // prompt for person's name before allowing to post
    var name = Cookies.get('name');

    if (!name || name === 'null') {
      name = window.prompt('What is your name/handle?'); // eslint-disable-line
      Cookies.set('name', name);
    }
    socket.emit('io:name', name);
    $('#m').focus(); // focus cursor on the message input

    return name;
  }

  function leadZero (number) {
    return (number < 10) ? '0' + number : number;
  }

  function getTime (timestamp) {
    var t, h, m, s;

    t = new Date(timestamp);
    h = leadZero(t.getHours());
    m = leadZero(t.getMinutes());
    s = leadZero(t.getSeconds());

    return String(h) + ':' + m + ':' + s;
  }

  /**
   * renders messages to the DOM. nothing fancy. want fancy? ask!
   * @param {String} message - the message (stringified object) to be displayed.
   * @returns {Boolean} false;
   */
  function renderMessage (message) {
    var msg = JSON.parse(message);
    var html = '<li class=\'row\'>';

    html += '<small class=\'time\'>' + getTime(msg.t) + ' </small>';
    html += '<span class=\'name\'>' + msg.n + '</span>';
    html += '<p class=\'msg\'>' + msg.m + '</p>';
    html += '</li>';
    $('#messages').append(html);  // append to list
  }

  $('form').submit(function () {
    var msg;

    // if input is empty or white space do not send message
    if ($('#m').val()
      .match(/^[\s]*$/) !== null) {
      $('#m').val('');
      $('#m').attr('placeholder', 'please enter your message here');
    } else if (!Cookies.get('name') || Cookies.get('name').length < 1
      || Cookies.get('name') === 'null') {
      getName();
    } else {
      msg = $('#m').val();
      socket.emit('io:message', msg);
      $('#m').val(''); // clear message form ready for next/new message
      $('#m').attr('placeholder', ''); // clears placeholder once a msg is successfully sent
    }

    return false;
  });

  // keeps latest message at the bottom of the screen
  // http://stackoverflow.com/a/11910887/2870306
  function scrollToBottom () {
    var chatdiv = document.getElementById('messages');

    chatdiv.scrollTop = chatdiv.scrollHeight;
  }

  window.onresize = function () {
    scrollToBottom();
  };

  socket.on('chat:messages:latest', function (msg) {
    // console.log('>> ' + msg);
    renderMessage(msg);
    scrollToBottom();
  });

  socket.on('chat:people:new', function (name) {
    $('#joiners').show();
    $('#joined').text(name);
    $('#joiners').fadeOut(5000);
  });

  //receive message from server
  socket.on('game:boards:latest', function(data){
    var ndata=JSON.parse(data);
    var boardsize = ndata.d;
    
    console.log(data);
    console.log(boardsize);
    //typeof value != 'undefined' && value
    if(boardsize === null){
       console.log('clear')//check if board is ereased
       document.getElementById('board').style.display = '';//clear inline style
       document.getElementById('board').style.display = "none";//hide
        //erase whatever is data is saved
        var node = document.getElementById('board');
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
       //show the buttons!!
       document.getElementsByClassName('buttons')[0].style.display = "flex";
    } else if(document.getElementsByClassName('board')[0].style.display == "flex") {
        console.log('board already built');//if board is built don't do it again
    } else {
        console.log('building board');
        
        //a is the length of one side of the board
        document.getElementsByClassName('buttons')[0].style.display = "none";
        document.getElementsByClassName('board')[0].style.display = "flex";
        var built = true;
        //x is column,y is row, z is cell, r is subboard
        
        //subboard
        var b = boardsize/3;
        var sidelength = 90/b;
        var r=0;
        
        //build the board
        for(var x = 0; x < b; x++) {
            
            for(var y = 0; y < b; y++) {
                //sidelength
                var side = 80/boardsize;
                var padding = 2/(boardsize);
                
                //subboard
                var subboard = $("<div style='width:"+sidelength+"vh;height:"+sidelength+"vh;margin:"+padding+"vh' class='sub sub"+r+"'></div>");
                subboard.appendTo('.board');
                
                //add units
                for(var z=0;z<9;z++){
                    var unit = $("<div style='width:"+side+"vh;height:"+side+"vh;margin:"+padding+"vh' class='unit num"+z+"'>"+z+"</div>");
                    unit.appendTo('.sub'+r);
                    //unit.appendTo('.board');
                }
                r++;
            }
        }
    }
  });
  
  getName();

  function loadMessages () {
    $.get('/load', function (data) {
      data.forEach(function (msg) {
        renderMessage(msg);
      });
      scrollToBottom();
    });    
  }
  loadMessages();
  
  function loadGame () {
      //check if empty?
    $.get('/loadGame', function (size) {
        //console.log(size.pop()); //if we don't need to save gameboards
        
        var NGobj = JSON.parse(size[size.length - 1])
        var board = NGobj.d;
        
        createboard(board)
        
    });
    
  }    
  loadGame();
  
});

function clearboard () {
    var socket = io();
    socket.emit('io:clearboard');    
}

//pick a board, 3, 9 or 27
function createboard (a) {
    var socket = io();
    socket.emit('io:pickboard', a);
}

