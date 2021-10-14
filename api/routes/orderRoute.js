const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const orderModel = require('../models/Order')
const productModel = require('../models/Product')
const checkAuth = require('../middleware/checkAuth')

const errormsg = (err) => {
    res.status(500).json({
        error: err
    })
}

router.get('/', (req, res) => {
    orderModel.find().exec().then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    productId: doc.productId,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            })
        })
    }).catch(errormsg)
})

router.get('/:orderId', (req, res) => {
    if (mongoose.isValidObjectId(req.params.orderId)) {
        orderModel.findById(req.params.orderId).exec().then(doc => {
            if (!doc) {
                return res.status(404).json({
                    message: 'Order not found!!'
                })
            }
            res.status(200).json({
                order: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            })
        }).catch(errormsg)
    }
    else {
        return res.status(422).json({
            message: 'Order ID is not valid!!'
        })
    }
})

router.post('/', (req, res) => {
    productModel.findById(req.body.productId).then(doc => {
        if (!doc) {
            return res.status(404).json({
                message: 'Product not found!!'
            })
        }
        const order = new orderModel({
            productId: req.body.productId,
            quantity: req.body.quantity
        })
        return order.save()
    })
        .then(result => {
            res.status(201).json({
                message: 'Order created successfully!',
                createdOrder: {
                    productId: result.productId,
                    quantity: result.quantity
                },
                _id: result._id,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders/" + result._id
                }
            })
        })
        .catch(errormsg)
})

router.delete('/:orderId', (req, res) => {
    orderModel.deleteOne({ _id: req.params.orderId }).then(doc => {
        res.status(200).json({
            message: 'Order deleted successfully',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        })
    })
        .catch(errormsg)
})

module.exports = router