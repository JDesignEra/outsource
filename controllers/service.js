const path = require('path');
const Services = require('../models/services');
const Users = require('../models/users');
const Transactions = require('../models/transactions');
const fs = require('fs');
var paypal = require('paypal-rest-sdk');

let today = new Date();
let dd = today.getDate();

let mm = today.getMonth()+1; 
let yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 
today = dd+'/'+mm+'/'+yyyy;

module.exports = {
    index: function (req, res) {
        Services.findAll({
            order: [
                ['name', 'ASC']
            ],
            raw: true
        })
            .then((services) => {
                res.render('services/list', {
                    services: services,
                });
            })
            .catch(err => console.log(err));
    },
    view: function (req, res) {
        Users.findOne({
            where: {
                id: req.user.id
            }
        }).then((user) => {
            Services.findOne({
                where: {
                    id: req.params.id
                }
            }).then((services) => {
                Services.update({
                    views: services.views + 1
                }, {
                        where: {
                            id: req.params.id
                        }
                    }).then(() => {
                        res.render('services/index', {
                            services,
                            user
                        });
                    })
            }).catch(err => console.log(err));
        })

    },
    add: function (req, res) {
        if (req.user.accType === 'service') {
            res.render('services/add')
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
        let price = req.body.price;
        let category = req.body.categories.toString();
        Services.create({
            name,
            desc,
            price,
            uid: userId,
            category,
            views: 0,
            date: today,
            time: new Date().getTime()
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
            req.flash('success', 'Service added successfully!')
            res.redirect('/profile');
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
                res.redirect('/profile');
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
                res.redirect('/profile');
            }

            else {
                Services.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then((services) => {
                    req.flash('success', 'Service successfully deleted!');
                    res.redirect('/profile');
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

                                var create_payment_json = {
                                    "intent": "sale",
                                    "payer": {
                                        "payment_method": "paypal"
                                    },
                                    "redirect_urls": {
                                        "return_url": `http://localhost:5000/services/payment/${service.id}/success/`,
                                        "cancel_url": "http://localhost:5000/"
                                    },
                                    "transactions": [{
                                        "item_list": {
                                            "items": [{
                                                "name": service.name,
                                                "sku": "001",
                                                "price": String(service.price),
                                                "currency": "USD",
                                                "quantity": 1
                                            }]
                                        },
                                        "amount": {
                                            "currency": "USD",
                                            "total": String(service.price)
                                        },
                                        "description": `Payment for ${service.name} by ${freelancer.username}`
                                    }]
                                };

                                paypal.payment.create(create_payment_json, function (error, payment) {
                                    if (error) {
                                        throw error;
                                    }

                                    else {

                                        for (i = 0; i < payment.links.length; i++) {
                                            if (payment.links[i].rel == 'approval_url') {
                                                req.flash('success', "Payment sent.")
                                                res.redirect(payment.links[i].href)
                                            }
                                        }
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
                    payerId = req.query.PayerID;
                    paymentId = req.query.paymentId;

                    var execute_payment_json = {
                        "payer_id": payerId,
                        "transactions": [{
                            "amount": {
                                "currency": "USD",
                                "total": String(service.price)
                            }
                        }]
                    }

                    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                        if (error) {
                            console.log(error.response);
                            throw error;
                        } else {
                            console.log("Get Payment Response");
                            console.log(JSON.stringify(payment));

                            Transactions.create({
                                serviceProvider: freelancer.username,
                                freelancerPaypal: freelancer.paypal,
                                paypalMerchantID: payment.transactions[0].payee.merchant_id,

                                paidWith: capitalize(payment.payer.payment_method),

                                paypalTransactionID: payment.id,
                                serviceName: payment.transactions[0].item_list.items[0].name,
                                description: payment.transactions[0].description,
                                price: payment.transactions[0].item_list.items[0].price,
                                currency: payment.transactions[0].item_list.items[0].currency,
                                date: payment.create_time,

                                uid: client.id,

                            }).then((transaction) => {
                                // res.send("success")
                                res.render("services/paymentDetails", {
                                    payment: payment,
                                    client: client,
                                    freelancer: freelancer
                                })
                            })

                        }
                    })
                })

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