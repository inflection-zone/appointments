const PaymentTransaction = require('../models/payment.transaction.model.js')
const BusinessNode = require('../models/business.node.model.js')
const Customer = require('../models/customer.model.js')
const Appointment = require('../models/appointment.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new transaction: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.customer_id ||
        !request.body.total_amount) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_node_id = request.body.business_node_id
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var customer_id = request.body.customer_id
    var customer = await Customer.find_by_id(customer_id)
    if (!customer) {
        var message = "Customer with id " + customer_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var appointment_id = request.body.appointment_id
    var appointment = await Appointment.find_by_id(appointment_id)
    if (!appointment) {
        var message = "Appointment with id " + appointment_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var new_transaction = {}
    new_transaction.business_node_id = request.body.business_node_id
    new_transaction.customer_id = request.body.customer_id
    new_transaction.total_amount = request.body.total_amount

    new_transaction.currency = request.body.currency ? request.body.currency : ''
    new_transaction.external_id = request.body.external_id ? request.body.external_id : null
    new_transaction.status = request.body.status ? request.body.status : null
    new_transaction.is_complete = request.body.is_complete ? request.body.is_complete : false

    new_transaction.initiated_on = request.body.initiated_on ? moment(request.body.initiated_on).toDate() : null
    new_transaction.completed_on = request.body.completed_on ? moment(request.body.completed_on).toDate() : null

    new_transaction.is_active = request.body.is_active ? request.body.is_active : true

    var transaction = await PaymentTransaction.create(new_transaction)

    return response.json({
        success: true, message: 'Payment transaction created', data: {
            transaction: transaction
        }
    })
}

module.exports.find_all = async (request, response) => {

    console.log('Get all transactions')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    const customer_id = (typeof request.query.customer_id != 'undefined') ? request.query.customer_id : null;
    const appointment_id = (typeof request.query.appointment_id != 'undefined') ? request.query.appointment_id : null;

    if (business_node_id != null) {
        var business_node = await BusinessNode.find_by_id(business_node_id)
        if (business_node == null) {
            var message = "Business node with id " + business_node_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    if (customer_id != null) {
        var customer = await Customer.find_by_id(customer_id)
        if (!customer) {
            var message = "Customer with id " + customer_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var appointment = await Appointment.find_by_id(appointment_id)
    if (!appointment) {
        var message = "Appointment with id " + appointment_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var selector = {
        is_active: true
    }
    if (business_node_id != null) {
        selector.business_node_id = business_node_id
    }
    if (customer_id != null) {
        selector.customer_id = customer_id
    }
    if (appointment_id != null) {
        selector.appointment_id = appointment_id
    }

    var transactions = await PaymentTransaction.find_all(selector);

    return response.json({ success: true, message: 'Payment transaction list', data: { transactions: transactions } })
}

module.exports.find_by_id = async (request, response) => {

    var transaction_id = request.params.transaction_id
    console.log('Find transaction by id: ', transaction_id)

    if (!transaction_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var notification = await PaymentTransaction.find_by_id(transaction_id)
    return response.json({ success: true, message: 'Payment transaction', data: { notification: notification } })
}

module.exports.update = async (request, response) => {

    console.log('Update transaction by id')

    if (!request.params.transaction_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var transaction_id = request.params.transaction_id;
    var message = await PaymentTransaction.find_by_id(transaction_id)
    if (message == null) {
        return response.json({ success: false, message: 'Payment transaction not found', data: {} })
    }

    var update_fields = get_update_fields(request)
    var updated = await PaymentTransaction.update(transaction_id, update_fields)
    return response.json({ success: true, message: 'Payment transaction updated successfully', data: { updated: updated } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = request.body.business_node_id
    }

    if (request.body.hasOwnProperty('customer_id')) {
        update_fields.customer_id = request.body.customer_id
    }
    if (request.body.hasOwnProperty('appointment_id')) {
        update_fields.appointment_id = request.body.appointment_id
    }
    if (request.body.hasOwnProperty('external_id')) {
        update_fields.external_id = request.body.external_id
    }
    if (request.body.hasOwnProperty('total_amount')) {
        update_fields.total_amount = request.body.total_amount
    }
    if (request.body.hasOwnProperty('currency')) {
        update_fields.currency = request.body.currency
    }

    if (request.body.hasOwnProperty('status')) {
        update_fields.status = request.body.status
    }
    if (request.body.hasOwnProperty('is_complete')) {
        update_fields.is_complete = request.body.is_complete
    }
    if (request.body.hasOwnProperty('initiated_on')) {
        update_fields.initiated_on = moment(request.body.initiated_on).toDate()
    }
    if (request.body.hasOwnProperty('completed_on')) {
        update_fields.completed_on = moment(request.body.completed_on).toDate()
    }

    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

// Update message by id
module.exports.delete_by_id = async (request, response) => {

    console.log('Delete transaction by id: ', request.params.transaction_id)

    if (!request.params.transaction_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var transaction_id = request.params.transaction_id;
    var message = await PaymentTransaction.find_by_id(transaction_id)
    if (message == null) {
        return response.json({ success: false, message: 'Payment transaction not found', data: {} })
    }

    var deleted = await PaymentTransaction.delete_by_id(transaction_id)
    return response.json({ success: true, message: 'Payment transaction deleted successfully.', data: { deleted: deleted } })
}

