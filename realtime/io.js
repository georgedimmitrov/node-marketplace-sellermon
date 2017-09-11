const async = require('async');
const User = require('../models/user');
const Order = require('../models/order');

module.exports = function(io) {

  io.on('connection', function(socket) {

    const user = socket.request.user;
    // console.log(user.name);

    const orderId = socket.request.session.orderId;

    socket.join(orderId);

    socket.on('chatTo', data => {
      async.parallel([
        callback => {
          io.in(orderId).emit('incomingChat', {
            message: data.message,
            sender: user.name,
            senderId: user._id,
            senderImage: user.photo
          });
        },
        callback => {
          // Save Order Object
        }
      ]);
    });

  });
}
