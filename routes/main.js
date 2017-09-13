const router = require('express').Router();
const async = require('async');
const Gig = require('../models/gig');
const User = require('../models/user');
const Promocode = require('../models/promocode');
const algoliasearch = require('algoliasearch')

const client = algoliasearch("YW97YQRZ4D", "251624f8fceca1363f51c8d3eac5c2d7");
const index = client.initIndex('GigSchema');

router.get('/', (req, res) => {
  Gig.find({}, (err, gigs) => {
    res.render('main/home', { gigs });
  });
});

router.route('/search')
  .get((req, res) => {
    if (req.query.q) {
      index.search(req.query.q, (err, content) => {
        res.render('main/search_results', { content, search_result: req.query.q });
      });
    }
  })
  .post((req, res) => {
    res.redirect(`/search?q=${req.body.search_input}`);
  });

router.get('/my-gigs', (req, res) => {
  Gig.find({ owner: req.user._id }, (err, gigs) => {
    res.render('main/my-gigs', { gigs });
  });
});

router
  .route('/add-new-gig')
  .get((req, res) => {
    res.render('main/add-new-gig');
  })
  .post((req, res, next) => {
    async.waterfall([
      callback => {
        const gig = new Gig();
        gig.owner = req.user._id;
        gig.title = req.body.gig_title;
        gig.category = req.body.gig_category;
        gig.about = req.body.gig_about;
        gig.price = req.body.gig_price;

        gig.save(err => {
          callback(err, gig);
        });
      },
      (gig, callback) => {
        User.update(
          {
            _id: req.user._id
          },
          {
            $push: { gigs: gig._id }
          },
          (err, count) => {
            res.redirect('/my-gigs');
          }
        );
      }
    ]);
  });

router.get('/service_detail/:id', (req, res, next) => {
  Gig.findOne({ _id: req.params.id })
    .populate('owner')
    .exec((err, gig) => {
      res.render('main/service_detail', { gig });
    });
});

// Promocode
router.get('/api/add-promocode', (req, res) => {
  const promocode = new Promocode();
  promocode.name = 'testcoupon';
  promocode.discount = 0.4;
  promocode.save((err) => {
    res.json('successful');
  });
});

router.post('/promocode', (req, res) => {
  const promocode = req.body.promocode;
  const totalPrice = req.session.price;
  Promocode.findOne({ name: promocode }, (err, foundCode) => {
    if (foundCode) {
      let newPrice = foundCode.discount * totalPrice;
      newPrice = totalPrice - newPrice;
  
      req.session.price = newPrice;
      res.json(newPrice);
    } else {
      res.json(0);
    }
  });
});

module.exports = router;
