# Hapi.js Socket.io Redis Chat Example

A basic chat application built with Hapi.js Socket.io and Redis Pub/Sub

> Try it: https://hapi-chat.herokuapp.com/

![hapi-chat-demo](https://cdn.rawgit.com/nelsonic/nelsonic.github.io/master/img/hapi-chat-full-res.gif)

## Why

Node.js Chat Apps are practically the "Hello World" of real-time apps.
If you Google for
"[node.js chat example](https://www.google.pt/search?q=node.js+chat+example)"
you will see *thousands* of results! But ... 90% of the examples use Express.js,
95% use MongoDB to store data/messages and **100% don't have any tests**.
So, *this* example is for the the people who identify with:
> "_We use **hapi.js** because we want our code to be **performant** and **reliable**_"

As with *all* our examples we have a suite of tests.

## What?

[Real-Time](https://en.wikipedia.org/wiki/Real-time_computing#Near_real-time) Chat is an _integral_ part of _any_ communications system. Building a (*basic*) chat system is *easy* with Socket.io.


## How?

We are using the following components to build our chat app:

1. **Hapi.js** (node.js web framework) - If you haven't used Hapi.js before, checkout our introductory tutorial: https://github.com/nelsonic/learn-hapi
+ **Socket.io** (WebSockets with fallback for older clients) - If you're new to Soecket.io see: http://socket.io/get-started/chat/
+ **Redis** (high performance message storage and publish/subscribe) - If you or anyone on your team are *completely* new to Redis, check out: https://github.com/dwyl/learn-redis

### Why Redis?

Socket.io only handles distributing messages, if people disconnect from the chat they will miss any subsequent messages and when anyone connects there will see no history ... so we need a place to store messages for retrieval.

Top 3 reasons why Redis is the *clear* choice for storing chat messages.

1. ***Speed***  - *much faster than MongoDB, CouchDB or PostgreSQL*
2. ***Simple*** - pushing messages onto a list (set) is the _simplest
possible_ way to store a chat history.
3. ***Scalable*** ***Publish/Subscribe***


### Mobile First

Given the simplicity of the UI, the chat app is mobile-first by default.

### Returning Visitor

####  How Many Recent Messages Should we Cache?


### Data Model




## Background Reading

+ **Matt Harrison** has *basic example*, but ***no tests*** (*bad habits*):
http://matt-harrison.com/using-hapi-js-with-socket-io
