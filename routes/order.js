const router = require('express').Router();
const Gig = require('../models/gig');
const Order = require('../models/order');
const config = require('../config/secret');
const stripe = require('stripe')(config.stripeSecret);

const fee = 3.15;

router.get('/checkout/single_package/:id', (req, res) => {
  Gig.findOne({ _id: req.params.id }, (err, gig) => {
    const totalPrice = gig.price + fee;
    req.session.gig = gig;
    req.session.price = totalPrice;
    res.render('checkout/single_package', { gig, totalPrice });
  });
});

router
  .route('/payment')
  .get((req, res) => {
    res.render('checkout/payment');
  })
  .post((req, res, next) => {
    const gig = req.session.gig;
    let price = req.session.price;
    price *= 100;

    stripe.customers
      .create({
        email: req.user.email
      })
      .then(customer => {
        return stripe.customers.createSource(customer.id, {
          source: req.body.stripeToken
        });
      })
      .then(source => {
        return stripe.charges.create({
          amount: price,
          currency: 'usd',
          customer: source.customer
        });
      })
      .then(charge => {
        // New charge created on a new customer
        const order = new Order();
        order.buyer = req.user._id;
        order.seller = gig.owner;
        order.gig = gig._id;
        order.save(err => {
          req.session.gig = null;
          req.session.price = null;
          res.redirect(`/users/${req.user._id}/orders/${order._id}`);
        });
      })
      .catch(err => {
        // Deal with an error
      });
  });

// Chat Page
router.get('/users/:userId/orders/:orderId', (req, res) => {
  req.session.orderId = req.params.orderId;
  Order.findOne({ _id: req.params.orderId })
    .populate('buyer seller gig')
    .deepPopulate('messages.owner')
    .exec((err, order) => {
      console.log(order);
      res.render('order/order-room', {
        layout: 'chat-layout',
        order,
        helpers: {
          if_equals: function(a, b, opts) {
            if (a.equals(b)) {
              return opts.fn(this);
            }
            return opts.inverse(this);
          }
        }
      });
    });
});

router.get('/users/:id/manage_orders', (req, res) => {
  Order.find({ seller: req.user._id })
    .populate('buyer seller gig')
    .exec((err, orders) => {
      res.render('order/order-seller', { orders });
    });
});

router.get('/users/:id/orders', (req, res) => {
  Order.find({ buyer: req.user._id })
    .populate('buyer seller gig')
    .exec((err, orders) => {
      res.render('order/order-buyer', { orders });
    });
});

module.exports = router;
