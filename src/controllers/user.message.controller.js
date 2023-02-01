const Customer = require('../models/customer.model.js')
const BusinessNode = require('../models/business.node.model.js')
const UserMessage = require('../models/user.message.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new message: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.customer_id ||
        !request.body.body ||
        !request.body.type ||
        !request.body.type_id) {
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

    var new_message = {}
    new_message.business_node_id = request.body.business_node_id

    new_message.customer_id = request.body.customer_id
    new_message.body = request.body.body
    new_message.type = request.body.type
    new_message.type_id = request.body.type_id
    new_message.message_id = request.body.message_id ? request.body.message_id : null
    new_message.error = request.body.error ? request.body.error : null

    new_message.is_sent = request.body.is_sent ? request.body.is_sent : true
    new_message.sent_on = request.body.sent_on ? moment(request.body.sent_on).toDate() : null

    new_message.is_deleted = request.body.is_deleted ? request.body.is_deleted : false
    new_message.deleted_on = request.body.deleted_on ? moment(request.body.deleted_on).toDate() : null

    new_message.is_active = request.body.is_active ? request.body.is_active : true

    var message = await UserMessage.create(new_message)

    return response.json({
        success: true, message: 'Message message created', data: {
            message: message
        }
    })
}

module.exports.find_all = async (request, response) => {

    console.log('Get all messages')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    const customer_id = (typeof request.query.customer_id != 'undefined') ? request.query.customer_id : null;

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

    var selector = {
        is_active: true
    }
    if (business_node_id != null) {
        selector.business_node_id = business_node_id
    }
    if (customer_id != null) {
        selector.customer_id = customer_id
    }

    var messages = await UserMessage.find_all(selector);

    return response.json({ success: true, message: 'Message messages list', data: { messages: messages } })
}

module.exports.find_by_id = async (request, response) => {

    var message_id = request.params.message_id
    console.log('Find message by id: ', message_id)

    if (!message_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var message = await UserMessage.find_by_id(message_id)
    return response.json({ success: true, message: 'Message', data: { message: message } })
}

// Update message by id
module.exports.update = async (request, response) => {

    console.log('Update message by id')

    if (!request.params.message_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var message_id = request.params.message_id;
    var message = await UserMessage.find_by_id(message_id)
    if (message == null) {
        return response.json({ success: false, message: 'Message not found', data: {} })
    }

    var update_fields = get_update_fields(request)
    var updated = await UserMessage.update(message_id, update_fields)
    return response.json({ success: true, message: 'Message updated successfully', data: { message: updated } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = request.body.business_node_id
    }

    if (request.body.hasOwnProperty('customer_id')) {
        update_fields.customer_id = request.body.customer_id
    }
    if (request.body.hasOwnProperty('body')) {
        update_fields.body = request.body.body
    }
    if (request.body.hasOwnProperty('type')) {
        update_fields.type = request.body.type
    }
    if (request.body.hasOwnProperty('type_id')) {
        update_fields.type_id = request.body.type_id
    }
    if (request.body.hasOwnProperty('message_id')) {
        update_fields.message_id = request.body.message_id
    }
    if (request.body.hasOwnProperty('error')) {
        update_fields.error = request.body.error
    }

    if (request.body.hasOwnProperty('is_sent')) {
        update_fields.is_sent = request.body.is_sent
    }
    if (request.body.hasOwnProperty('sent_on')) {
        update_fields.sent_on = moment(request.body.sent_on).toDate()
    }

    if (request.body.hasOwnProperty('is_deleted')) {
        update_fields.is_deleted = request.body.is_deleted
    }
    if (request.body.hasOwnProperty('deleted_on')) {
        update_fields.deleted_on = moment(request.body.deleted_on).toDate()
    }

    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

module.exports.delete_by_id = async (request, response) => {
    console.log('Delete message by id: ', request.params.message_id)

    if (!request.params.message_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var message_id = request.params.message_id;
    var message = await UserMessage.find_by_id(message_id)
    if (message == null) {
        return response.json({ success: false, message: 'Message not found', data: {} })
    }

    var deleted = await UserMessage.delete_by_id(message_id)
    return response.json({ success: true, message: 'Message deleted successfully.', data: { deleted: deleted } })
}

