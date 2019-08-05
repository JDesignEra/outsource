const countryList = require('countries-list');
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
                users.findOne({
                    where: { id: service['uid'] },
                    attributes: ['username', 'email', 'followers', 'website', 'gender', 'location', 'occupation', 'bio', 'skills'],
                }).then(user => {
                    service['user'] = user;
                    service['user']['skills'] = service['user']['skills'].split(',').filter(function(el) {return el !== null && el !== ''});

                    Object.keys(countryList.countries).forEach(key => {
                        if (countryList.countries[key].name === service['user']['location']) {
                            service['user']['country'] = key;
                        }
                    });
                });
            }

            services.findAll({
                order: [['views', 'DESC']],
                limit: 4
            }).then(topServiceViews => {
                for (let service of topServiceViews) {
                    users.findOne({
                        where: { id: service['uid'] },
                        attributes: ['username', 'email', 'followers', 'website', 'gender', 'location', 'occupation', 'bio', 'skills'],
                    }).then(user => {
                        service['user'] = user;
                        service['user']['skills'] = service['user']['skills'].split(',').filter(function(el) {return el !== null && el !== ''});

                        Object.keys(countryList.countries).forEach(key => {
                            if (countryList.countries[key].name === service['user']['location']) {
                                service['user']['country'] = key;
                            }
                        });
                    });
                }

                services.findAll({
                    order: sequelize.literal('rand()'),
                    limit: 4
                }).then(randomServices => {
                    for (let service of randomServices) {
                        users.findOne({
                            where: { id: service['uid'] },
                            attributes: ['username', 'email', 'followers', 'website', 'gender', 'location', 'occupation', 'bio', 'skills'],
                        }).then(user => {
                            service['user'] = user;
                            service['user']['skills'] = service['user']['skills'].split(',').filter(function(el) {return el !== null && el !== ''});

                            Object.keys(countryList.countries).forEach(key => {
                                if (countryList.countries[key].name === service['user']['location']) {
                                    service['user']['country'] = key;
                                }
                            });
                        });
                    }

                    portfolios.findAll({
                        order: [['views', 'DESC']],
                        limit: 4
                    }).then(topPortfolioViews => {
                        for (let portfolio of topPortfolioViews) {
                            let datePosted = moment.duration(moment(new Date).diff(portfolio['datePosted']));
                            datePosted = datePosted / (1000 * 60 * 60 * 24) < 1 ? `${datePosted.humanize()} ago` : moment(datePosted).format('DD/MM/YYYY');

                            portfolio['date'] = datePosted;

                            users.findOne({
                                where: { id: portfolio['uid'] },
                                attributes: ['username', 'email', 'followers', 'website', 'gender', 'location', 'occupation', 'bio', 'skills'],
                            }).then(user => {
                                portfolio['user'] = user;
                                portfolio['user']['skills'] = portfolio['user']['skills'].split(',').filter(function(el) {return el !== null && el !== ''});

                                Object.keys(countryList.countries).forEach(key => {
                                    if (countryList.countries[key].name === portfolio['user']['location']) {
                                        portfolio['user']['country'] = key;
                                    }
                                });
                            });
                        }

                        portfolios.findAll({
                            order: sequelize.literal('rand()'),
                            limit: 4
                        }).then(randomPorfolios => {
                            if (randomPorfolios.length > 0) {
                                for (let [i, portfolio] of randomPorfolios.entries()) {
                                    let datePosted = moment.duration(moment(new Date).diff(portfolio['datePosted']));
                                    datePosted = datePosted / (1000 * 60 * 60 * 24) < 1 ? `${datePosted.humanize()} ago` : moment(datePosted).format('DD/MM/YYYY');
    
                                    portfolio['date'] = datePosted;
    
                                    users.findOne({
                                        where: { id: portfolio['uid'] },
                                        attributes: ['username', 'email', 'followers', 'website', 'gender', 'location', 'occupation', 'bio', 'skills'],
                                    }).then(user => {
                                        portfolio['user'] = user;
                                        portfolio['user']['skills'] = portfolio['user']['skills'].split(',').filter(function(el) {return el !== null && el !== ''});

                                        Object.keys(countryList.countries).forEach(key => {
                                            if (countryList.countries[key].name === portfolio['user']['location']) {
                                                portfolio['user']['country'] = key;
                                            }
                                        });
                                    });
    
                                    if (i >= randomPorfolios.length - 1) {
                                        setTimeout(function() {
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

                                            clearTimeout(this);
                                        }, 50);
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