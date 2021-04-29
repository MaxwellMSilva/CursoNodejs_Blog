const express = require('express');
const slugify = require('slugify');

const router = express.Router();

const Article = require('./Article');
const Category = require('../categories/Category');

const adminAuth = require('../middlewares/adminAuth');

router.get('/admin/articles', adminAuth, (request, response) => {


    Article.findAll({ 
        include: [{ model: Category }] 
    }).then(articles => {
        response.render('admin/articles/index', {
            articles: articles
        });
    });
});

router.get('/admin/articles/new', adminAuth, (request, response) => {
    Category.findAll().then((categories) => {
        response.render('admin/articles/new', {
            categories: categories
        });
    });
});

router.post('/articles/save', adminAuth, (request, response) => {
    var title = request.body.title;
    var body = request.body.body;
    var category = request.body.category;

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category,
    }).then(() => {
        response.redirect('/admin/articles');
    });
});

router.post('/articles/delete', adminAuth, (request, response) => {
    var id = request.body.id;

    if (id != undefined) {
        if (!isNaN(id)) {
            Article.destroy({
                where: { id: id }
            }).then(() => {
                response.redirect('/admin/articles');
            })
        } else {
            response.redirect('/admin/articles');
        }
    } else {
        response.redirect('/admin/articles');
    }
});

router.get('/admin/articles/edit/:id', adminAuth, (request, response) => {
    var id = request.params.id;

    Article.findByPk(id).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                response.render('admin/articles/edit', {
                    categories: categories,
                    article: article,
                });
            });
        } else {
            response.redirect('*');
        }
    }).catch(err => {
        response.redirect('/');
    });
});

router.post('/articles/update', adminAuth, (request, response) => {
    var id = request.body.id;
    var title = request.body.title;
    var body = request.body.body;
    var categoryId = request.body.categoryId;

    Article.update({ title: title, body: body, categoryId: categoryId, slug: slugify(title)}, {
        where: { 
            id: id 
        }
    }).then(() => {
        response.redirect('/admin/articles');
    }).catch(err => {
        response.redirect('/admin/articles');
    });
})

router.get('/articles/page/:num', (request, response) => {
    var page = request.params.num;
    var offset = 0;

    if (isNaN(page) || page == 1) {
        offset = 0;
    } else {
        offset = (parseInt(page) - 1) * 4;
    }

    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order: [
            [ 'id', 'desc' ]
        ],
    }).then(articles => {
        var next;

        if (offset + 4 >= articles.count) {
            next = false;
        } else {
            next = true;
        }

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles,
        }

        Category.findAll().then(categories => {
            response.render('admin/articles/page', {
                result: result,
                categories: categories,
            });
        });
    });
});

module.exports = router;
