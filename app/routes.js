module.exports = function(app, passport, db) {
  const ObjectId = require('mongodb').ObjectID

// normal routes ===============================================================

    // show the home page (will also have our login links)


    app.get('/', function(req, res) {
      db.collection('entries').find({}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('index.ejs', {
          user : req.user,
          entries: result
          // might have to change
        })
      })
    })
    // });

  

 

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
      
      db.collection('entries').find({user:req.user._id}).toArray((err, result) => {
        if (err) return console.log(err)
        console.log(result)
        res.render('profile.ejs', {
          user: req.user,
          entries: result
        })

      })
    })

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/entry', (req, res) => {
    
      db.collection('entries').save({date: req.body.date, entry: req.body.entry, favorited: false, user: req.user._id}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
        // userId: req.user._id
      })
    })

    app.put('/entries', (req, res) => {
      db.collection('entries')
      .findOneAndUpdate({date: req.body.date, entry: req.body.entry}, {
        $set: {
          // thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/entries', (req, res) => {
      db.collection('entries').findOneAndDelete({date: req.body.date, entry: req.body.entry}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })



  app.put('/favorite', (req, res) => {
    console.log('hey im the id ' ,req.body)
    db.collection('entries')

    .findOneAndUpdate({
      _id: ObjectId(req.body.id)
    }, {
      $set: {
        favorited: true
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

  

// route middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
          return next();

      res.redirect('/');
  }}
