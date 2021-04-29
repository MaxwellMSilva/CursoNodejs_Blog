const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const connection = require('./database/database');

const app = express();

const categoriesController = require('./categories/categoriesController');
const articlesController = require('./articles/articlesController');
const usersController = require('./users/usersController');

const Category = require('./categories/Category');
const Article = require('./articles/Article');
const User = require('./users/Users');


// Sessions
app.use(session({
    secret: "senhaSecreta",
    cookie: { maxAge: 30000 }
}));

// View engine
app.set('view engine', 'ejs');

// Static   
app.use(express.static('public'));

// Body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database Connection
connection.authenticate()
            .then(() => {
                console.log('Conectado com sucesso!');
            }).catch((err) => {
                console.log(err);
            });


app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);


app.get('/', (request, response) => {
    Article.findAll({
        order: [
            [ 'id', 'desc' ]
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            response.render('index', {
                articles: articles,
                categories: categories,
            });
        });
    });
});

app.get('/:slug', (request, response) => {
    var slug = request.params.slug;

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                response.render('article', {
                    article: article,
                    categories: categories,
                });
            });
        } else {
            response.redirect('/');
        }
    }).catch(err => {
        response.redirect('/');
    });
});

app.get('/category/:slug', (request, response) => {
    var slug = request.params.slug;

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }]
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                response.render('index', {
                    articles: category.articles,
                    categories: categories,
                });
            });
        } else {
            response.redirect('/');
        }
    }).catch(err => {
        response.redirect('/');
    });
});

app.listen(3333);
