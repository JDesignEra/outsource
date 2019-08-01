const path = require('path');
const Services = require('../models/services');
const Servicefavs = require('../models/servicesfav');
const Users = require('../models/users');
const Jobs = require('../models/jobs');
const Transactions = require('../models/transactions');
const fs = require('fs');
var paypal = require('paypal-rest-sdk');
var Paypal_Adaptive = require('paypal-adaptive');

let today = new Date();
let dd = today.getDate();

let mm = today.getMonth() + 1;
let yyyy = today.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
}

if (mm < 10) {
    mm = '0' + mm;
}
today = dd + '/' + mm + '/' + yyyy;

var Paypal = require('paypal-adaptive');

var paypalSdk = new Paypal({
    userId: 'leemuel01234-facilitator_api1.gmail.com',
    password: 'JETYFMEU7DHBDSTT',
    signature: 'AQLS5ZF6WYR8wy9.2UEIhPrMryMSA9ANj1yE6rEgi7SHbK.AfnwjTf0l',
    sandbox: true //defaults to false
});
module.exports = {
    index: function (req, res) {
        Services.findAll({
            order: [
                ['name', 'ASC']
            ],
            raw: true
        }).then(serviceDatas => {
            res.render('services/list', {
                services: serviceDatas
            });
        })
            .catch(err => console.log(err));
    },
    view: function (req, res) {

        Services.findOne({
            where: {
                id: req.params.id
            }
        }).then((services) => {
            Users.findOne({
                where: {
                    id: services.uid
                }
            }).then((user) => {
                Jobs.findOne({
                    where: {
                        sid: services.id,
                        cid: req.user.id
                    }
                }).then((job) => {
                    Services.update({
                        views: services.views + 1
                    }, {
                            where: {
                                id: req.params.id
                            }
                        }).then(() => {
                            res.render('services/index', {
                                services,
                                serviceuser: user,
                                job
                            });
                        })
                })
            }).catch(err => console.log(err));
        })

    },

    management: function (req, res) {
        Services.findAll({
            where: {
                uid: req.user.id
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        })
            .then((services) => {
                res.render('services/manage', {
                    services: services,
                });
            })
            .catch(err => console.log(err));
    },

    requests: function(req, res){
        Jobs.findAll({
            where: {
                cid: req.user.id
            }
        }).then((jobs) => {
            res.render('services/requests', {
                jobs
            })
        })
    },

    add: function (req, res) {

        if (req.user.accType === 'service') {
            if (req.user.paypal === null || req.user.paypal === "") {
                req.flash('warning', ['You need to set up your PayPal account to make a service'])
                res.redirect('/profile/edit')
            }
            else {
                res.render('services/add')
            }
        }
        else {
            req.flash('warning', 'You need a service provider account to add a service');
            res.redirect('/');
        }
    },
    addpost: function (req, res) {
        let name = req.body.name;
        let desc = req.body.desc === undefined ? '' : req.body.desc.slice(0, 1999);
        let userId = req.user.id;
        let username = req.user.username;
        let price = req.body.price;
        let category = req.body.categories.toString();
        Services.create({
            name,
            desc,
            price,
            uid: userId,
            username,
            category,
            views: 0,
            date: today,
            time: new Date().getTime(),
            favourites: 0
        }).then((services) => {
            if (req.file !== undefined) {
                // Check if directory exists if not create directory
                if (!fs.existsSync('./public/uploads/services/' + req.user.id)) {
                    fs.mkdirSync('./public/uploads/services/' + req.user.id);
                }
                // Move file
                let serviceId = services.id;
                fs.renameSync(req.file['path'], './public/uploads/services/' + req.user.id + '/' + serviceId + '.png');
            }



            //Notifies users
            if (req.user.followers != null && req.user.followers.split(',').length > 0) {
                follower = req.user.followers.split(',')
                for (i = 0; i < follower.length; i++) {
                    follower[i] = parseInt(follower[i])
                }
                User.findAll({
                    where: {
                        id: { [Op.in]: follower }
                    }
                }).then(followerUser => {
                    for (i = 0; i < follower.length; i++) {
                        Notification.create({
                            uid: req.user.id,
                            username: req.user.username,
                            pid: services.id,
                            title: services.name,
                            date: new Date(),
                            category: "Services",
                            user: followerUser[i].id
                        })
                    }
                    req.flash('success', 'Service added successfully!')
                    res.redirect('/services/manage');
                })
            }
            else {
                req.flash('success', 'Service added successfully!')
                res.redirect('/services/manage');
            }



        })
            .catch(err => console.log(err))
    },

    edit: function (req, res) {
        let uid = req.user.id;
        let sid = req.params.id;

        Services.findOne({
            where: {
                id: sid,
                uid: uid
            }
        }).then((services) => {
            if (req.user.id === services.uid) {
                let imgPath = `/uploads/services/${uid}/${sid}.png`;

                res.render('services/edit', {
                    services: services,
                    img: imgPath
                });
            }
            else {
                req.flash('warning', 'You do not have permission to modify this service');
                res.redirect('/');
            }
        }

        ).catch(err => console.log(err));
    },
    save: function (req, res) {
        Services.update({
            name: req.body.name,
            desc: req.body.desc === undefined ? '' : req.body.desc.slice(0, 1999),
            price: req.body.price,
            category: req.body.categories.toString(),
            date: today,
            time: new Date().getTime()
        }, {
                where: {
                    id: req.params.id
                }
            }).then(() => {
                if (req.file !== undefined) {
                    console.log(req.params.id);
                    // Check if directory exists if not create directory
                    if (!fs.existsSync('./public/uploads/services/' + req.user.id)) {
                        fs.mkdirSync('./public/uploads/services/' + req.user.id);
                    }
                    // Move file
                    let serviceId = req.params.id;
                    fs.renameSync(req.file['path'], './public/uploads/services/' + req.user.id + '/' + serviceId + '.png');
                }

                req.flash('success', 'Changes saved successfully!');
                res.redirect('/services/manage');
            }).catch(err => console.log(err));
    },
    delete: function (req, res) {
        Services.findOne({
            where: {
                id: req.params.id,
                uid: req.user.id
            },
        }).then((services) => {

            if (services == null) {
                req.flash('warning', 'You do not have any services to delete');
                res.redirect('/services/manage');
            }

            else {
                Services.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then((services) => {
                    req.flash('success', 'Service successfully deleted!');
                    res.redirect('/services/manage');
                })
            }
        })
    },

    fav: function (req, res) {
        Servicefavs.findOne({
            where: {
                sid: req.params.id,
                uid: req.user.id
            }
        }).then((servicefavs) => {

            if (servicefavs == null) {
                Servicefavs.create({
                    uid: req.user.id,
                    sid: req.params.id
                }).then(() => {
                    Services.findOne({
                        where: {
                            id: req.params.id
                        }
                    }).then((services) => {
                        Services.update({
                            favourites: services.favourites + 1
                        }, {
                                where: {
                                    id: req.params.id
                                }
                            }).then(() => {
                                res.redirect('back')
                            })
                    }).catch(err => console.log(err));
                })

            }
            else if (req.params.id == servicefavs.sid && req.user.id == servicefavs.uid) {
                Servicefavs.destroy({
                    where: {
                        sid: req.params.id,
                        uid: req.user.id
                    }
                }).then(() => {
                    Services.findOne({
                        where: {
                            id: req.params.id
                        }
                    }).then((services) => {
                        Services.update({
                            favourites: services.favourites - 1
                        }, {
                                where: {
                                    id: req.params.id
                                }
                            }).then(() => {
                                res.redirect('back')
                            })
                    }).catch(err => console.log(err));
                })

            }
        })

    },

    //Lemuel
    payment: function (req, res) {
        console.log(req.params.id)
        Services.findOne({
            where: {
                id: req.params.id
            }
        })
            .then((service) => {
                console.log(service)
                console.log('1 \n===============================================================')
                Users.findOne({
                    where: {
                        id: req.user.id
                    }
                })
                    .then((client) => {
                        console.log(client)
                        console.log('2 \n===============================================================')
                        Users.findOne({
                            where: {
                                id: service.uid
                            }
                        })
                            .then((freelancer) => {
                                console.log(freelancer)
                                console.log('3 \n===============================================================')
                                res.render('services/payment', {
                                    service: service,
                                    client: client,
                                    freelancer: freelancer
                                });
                            })
                    })
            })

    },

    sendPayment: function (req, res) {
    Services.findOne({
        where: {
            id: req.params.id
        }
    })
        .then((service) => {
            Users.findOne({
                where: {
                    id: req.user.id
                }
            })
                .then((client) => {
                    Users.findOne({
                        where: {
                            id: service.uid
                        }
                    })
                        .then((freelancer) => {

                            var payload = {
                                requestEnvelope: {
                                    errorLanguage: 'en_US'
                                },
                                actionType: 'PAY',
                                currencyCode: 'USD',
                                feesPayer: 'EACHRECEIVER',
                                memo: `Payment for ${service.name} by ${freelancer.username}`,
                                cancelUrl: 'http://localhost:5000/',
                                returnUrl: `http://localhost:5000/services/payment/${service.id}/success/`,
                                receiverList: {
                                    receiver: [
                                        {
                                            email: `${freelancer.paypal}`,
                                            amount: String(service.price),
                                            primary: 'true'
                                        },
                                        {
                                            email: 'outsource_paypal@gmail.com',
                                            amount: String((service.price * 0.07).toFixed(2)),
                                            primary: 'false'
                                        }
                                    ]
                                }
                            };

                            paypalSdk.pay(payload, function (err, response) {
                                if (err) {
                                    console.log(err);
                                    req.flash('The service provider has provided an invalid PayPal email.')
                                    res.redirect('back');

                                    console.log(response);

                                } else {
                                    // Response will have the original Paypal API response
                                    console.log(response.payKey);
                                    req.session.payKey = response.payKey
                                    // But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
                                    res.redirect(response.paymentApprovalUrl);
                                }
                            });
                        })
                })
        })




    },

    PaymentSuccess: function (req, res) {
        Users.findOne({
            where: {
                id: req.user.id
            }
        }).then((client) => {
            Services.findOne({
                where: {
                    id: req.params.id
                }
            }).then((service) => {
                Users.findOne({
                    where: {
                        id: service.uid
                    }
                }).then((freelancer) => {
                    var params = {
                        payKey: req.session.payKey.toString()
                    };
                    paypalSdk.paymentDetails(params, function (err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            // payments details for this payKey, transactionId or trackingId
                            Transactions.create({
                                serviceProvider: freelancer.username,
                                freelancerPaypal: freelancer.paypal,
                                paypalMerchantID: response.paymentInfoList.paymentInfo[0].receiver.accountId,

                                paidWith: response.sender.email,

                                paypalTransactionID: response.paymentInfoList.paymentInfo[0].transactionId,
                                serviceName: service.name,
                                description: response.memo,
                                price: response.paymentInfoList.paymentInfo[0].receiver.amount,
                                currency: response.currencyCode,
                                date: response.responseEnvelope.timestamp,

                                uid: client.id,

                            }).then((transaction) => {
                                // res.send("success")
                                res.render("services/paymentDetails", {
                                    service,
                                    response: response,
                                    client: client,
                                    freelancer: freelancer
                                })
                            })
                        }
                    });
                })

            })
        })

    },

    transactions: function (req, res) {
        Transactions.findAll({
            where: {
                uid: req.user.id
            }
        }).then((transactions) => {
            res.render('services/transactionLists', {
                transactions
            })
        })
    },

    viewPaymentDetails: function (req, res) {
        Transactions.findOne({
            where: {
                id: req.params.id
            }
        }).then((transaction) => {
            res.render('services/viewPaymentDetails', {
                transaction
            })
        })
    }
}


function capitalize(components) {
    if (components == '') {
        components = 'None';
        return components;
    }
    else {
        return components.charAt(0).toUpperCase() + components.slice(1);
    }
}
stuff = {
    "id": "PAYID-LUXJSKQ1FW03336LR286012X",
    "intent": "sale",
    "state": "approved",
    "cart": "2VP90248MC2795219",
    "payer": {
        "payment_method": "paypal",
        "status": "VERIFIED",
        "payer_info":
        {
            "email": "annadoe_outsourcetest@gmail.com",
            "first_name": "Anna",
            "last_name": "Doe",
            "payer_id": "E9AYRMSE2YS4C",
            "shipping_address":
            {
                "recipient_name": "Anna Doe",
                "line1": "1 Main St",
                "city": "San Jose",
                "state": "CA",
                "postal_code":
                    "95131",
                "country_code": "US"
            },
            "country_code": "US"
        }
    },

    "transactions": [{
        "amount": { "total": "1000.00", "currency": "USD", "details": {} },
        "payee": { "merchant_id": "UVD23V44LPMAJ", "email": "johndoe_outsourcetest@gmail.com" },

        "description": "Payment for Money lend by Ryuse",

        "item_list": {
            "items": [{ "name": "Money lend", "sku": "001", "price": "1000.00", "currency": "USD", "quantity": 1 }],

            "shipping_address": {
                "recipient_name": "Anna Doe",
                "line1": "1 Main St",
                "city": "San Jose",
                "state": "CA",
                "postal_code": "95131",
                "country_code": "US"
            },

            "shipping_options": [null]
        },
        "related_resources": [{ "sale": { "id": "4XP58233JB345524E", "state": "completed", "amount": { "total": "1000.00", "currency": "USD", "details": { "subtotal": "1000.00" } }, "payment_mode": "INSTANT_TRANSFER", "protection_eligibility": "ELIGIBLE", "protection_eligibility_type": "ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE", "transaction_fee": { "value": "29.30", "currency": "USD" }, "parent_payment": "PAYID-LUXJSKQ1FW03336LR286012X", "create_time": "2019-07-17T03:44:13Z", "update_time": "2019-07-17T03:44:13Z", "links": [{ "href": "https://api.sandbox.paypal.com/v1/payments/sale/4XP58233JB345524E", "rel": "self", "method": "GET" }, { "href": "https://api.sandbox.paypal.com/v1/payments/sale/4XP58233JB345524E/refund", "rel": "refund", "method": "POST" }, { "href": "https://api.sandbox.paypal.com/v1/payments/payment/PAYID-LUXJSKQ1FW03336LR286012X", "rel": "parent_payment", "method": "GET" }] } }]
    }],

    "create_time": "2019-07-17T03:44:14Z",

    "links": [{ "href": "https://api.sandbox.paypal.com/v1/payments/payment/PAYID-LUXJSKQ1FW03336LR286012X", "rel": "self", "method": "GET" }], "httpStatusCode": 200
}