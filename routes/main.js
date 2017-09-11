const router = require('express').Router();
const async = require('async');
const Gig = require('../models/gig');
const User = require('../models/user');

router.get('/', (req, res) => {
  Gig.find({}, (err, gigs) => {
    res.render('main/home', { gigs });
  });
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

module.exports = router;
