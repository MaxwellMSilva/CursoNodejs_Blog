const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('./Users');

const router = express.Router();

router.get('/admin/users', (request, response) => {
    User.findAll().then(users => {
        if (request.session.user == undefined) {
            response.redirect('/');
        }

        response.render('admin/users/index', {
            users: users
        });
    });
});

router.get('/admin/users/create', (request, response) => {
    response.render('admin/users/create');
});

router.post('/users/create', (request, response) => {
    var email = request.body.email;
    var password = request.body.password;

    User.findOne({
        where: {
            email: email,
        }
    }).then(user => {
        if (user == undefined) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
        
            User.create({
                email: email,
                password: hash,
            }).then(() => {
                response.redirect('/');
            }).catch(err => {
                response.redirect('/');
            });
        } else {
            response.redirect('/admin/users/create');
        }
    });
});

router.get('/login', (request, response) => {
    response.render('admin/users/login');
});

router.post('/authenticate', (request, response) => {
    var email = request.body.email;
    var password = request.body.password;

    User.findOne({
        where: { email, email }
    }).then(user => {
        if (user != undefined) {
            var correct = bcrypt.compareSync(password, user.password);
            if (correct) {
                request.session.user = {
                    id: user.id,
                    email: user.email
                }
                response.redirect('/admin/articles');
            } else {
                response.redirect('/login');
            }
        } else {
            response.redirect('/login');
        }
    });
});

router.get('/logout', (request, response) => {
    request.session.user = undefined;
    response.redirect('/');
});

module.exports = router;
