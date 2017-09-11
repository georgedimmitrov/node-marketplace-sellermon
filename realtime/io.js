const async = require('async');
const User = require('../models/user');
const Order = require('../models/order');
const Message = require('../models/message');

module.exports = function(io) {

  io.on('connection', function(socket) {

    const user = socket.request.user;
    // console.log(user.name);

    const orderId = socket.request.session.orderId;

    socket.join(orderId);

    socket.on('chatTo', data => {
      async.waterfall([
        callback => {
          io.in(orderId).emit('incomingChat', {
            message: data.message,
            sender: user.name,
            senderId: user._id,
            senderImage: user.photo
          });

          const message = new Message();
          message.owner = user._id;
          message.content = data.message;
          message.save(err => {
            callback(err, message);
          });
        },
        (message, callback) => {
          Order.update(
            {
              _id: orderId
            }, {
              $push: { messages: message._id }
            }, (err, count) => {
              console.log(count);
            }
          );
        }
      ]);
    });

  });
}
