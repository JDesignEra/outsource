const sequelize = require('sequelize');

const services = require('../models/services');
const portfolios = require('../models/portfolio');
const users = require('../models/users');

module.exports = {
    index: function(req, res) {
        services.findAll({
            order: [['favourites', 'DESC']],
            limit: 4
        }).then(topServiceFavs => {
            for (let service of topServiceFavs) {
                users.findByPk(service['uid']).then(user => {
                    service['username'] = user['username'];
                });
            }

            services.findAll({
                order: [['views', 'DESC']],
                limit: 4
            }).then(topServiceViews => {
                for (let service of topServiceViews) {
                    users.findByPk(service['uid']).then(user => {
                        service['username'] = user['username'];
                    });
                }

                services.findAll({
                    order: sequelize.literal('rand()'),
                    limit: 4
                }).then(randomServices => {
                    for (let service of randomServices) {
                        users.findByPk(service['uid']).then(user => {
                            service['username'] = user['username'];
                        });
                    }

                    portfolios.findAll({
                        order: [['views', 'DESC']],
                        limit: 8
                    }).then(topPortfolioViews => {
                        for (let portfolio of topPortfolioViews) {
                            let datePosted = moment.duration(moment(new Date).diff(portfolio['datePosted']));
                            datePosted = datePosted / (1000 * 60 * 60 * 24) < 1 ? `${datePosted.humanize()} ago` : moment(datePosted).format('DD/MM/YYYY');

                            portfolio['date'] = datePosted;

                            users.findByPk(portfolio['uid']).then(user => {
                                portfolio['username'] = user['username'];
                            });
                        }

                        portfolios.findAll({
                            order: sequelize.literal('rand()'),
                            limit: 8
                        }).then(randomPorfolios => {
                            if (randomPorfolios.length > 0) {
                                for (let [i, portfolio] of randomPorfolios.entries()) {
                                    let datePosted = moment.duration(moment(new Date).diff(portfolio['datePosted']));
                                    datePosted = datePosted / (1000 * 60 * 60 * 24) < 1 ? `${datePosted.humanize()} ago` : moment(datePosted).format('DD/MM/YYYY');
    
                                    portfolio['date'] = datePosted;
    
                                    users.findByPk(portfolio['uid']).then(user => {
                                        portfolio['username'] = user['username'];
                                    });
    
                                    if (i >= randomPorfolios.length - 1) {
                                        setTimeout(() => {
                                            res.render('index', {
                                                services: {
                                                    topFavs: topServiceFavs,
                                                    topViews: topServiceViews,
                                                    randoms: randomServices
                                                },
                                                portfolios: {
                                                    topViews: topPortfolioViews,
                                                    randoms: randomPorfolios
                                                },
                                            });
                                        }, 100);
                                    }
                                }
                            }
                            else {
                                res.render('index', {
                                    services: {
                                        topFavs: topServiceFavs,
                                        topViews: topServiceViews,
                                        randoms: randomServices
                                    },
                                    portfolios: {
                                        topViews: topPortfolioViews,
                                        randoms: randomPorfolios
                                    },
                                });
                            }
                        });
                    });
                });
            });
        });
    }
}