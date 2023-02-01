const Notification = require('../models/notification.model.js')
const BusinessNode = require('../models/business.node.model.js')
const Customer = require('../models/customer.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new notification: ', request.body)

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

    var new_notification = {}
    new_notification.business_node_id = request.body.business_node_id

    new_notification.customer_id = request.body.customer_id
    new_notification.body = request.body.body
    new_notification.type = request.body.type
    new_notification.type_id = request.body.type_id
    new_notification.message = request.body.message ? request.body.message : null

    new_notification.title = request.body.title ? request.body.title : null

    new_notification.is_sent = request.body.is_sent ? request.body.is_sent : true
    new_notification.sent_on = request.body.sent_on ? moment(request.body.sent_on).toDate() : null

    new_notification.is_read = request.body.is_read ? request.body.is_read : true
    new_notification.read_on = request.body.read_on ? moment(request.body.read_on).toDate() : null

    new_notification.is_deleted = request.body.is_deleted ? request.body.is_deleted : false
    new_notification.deleted_on = request.body.deleted_on ? moment(request.body.deleted_on).toDate() : null

    new_notification.is_active = request.body.is_active ? request.body.is_active : true

    var notification = await Notification.create(new_notification)

    return response.json({
        success: true, message: 'Notification created', data: {
            notification: notification
        }
    })
}

module.exports.find_all = async (request, response) => {

    console.log('Get all notifications')

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

    var notifications = await Notification.find_all(selector);

    return response.json({ success: true, message: 'Notification list', data: { notifications: notifications } })
}

module.exports.find_by_id = async (request, response) => {

    var notification_id = request.params.notification_id
    console.log('Find message by id: ', notification_id)

    if (!notification_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var notification = await Notification.find_by_id(notification_id)
    return response.json({ success: true, message: 'Notification', data: { notification: notification } })
}

module.exports.update = async (request, response) => {

    console.log('Update message by id')

    if (!request.params.notification_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var notification_id = request.params.notification_id;
    var message = await Notification.find_by_id(notification_id)
    if (message == null) {
        return response.json({ success: false, message: 'Notification not found', data: {} })
    }

    var update_fields = get_update_fields(request)
    var updated = await Notification.update(notification_id, update_fields)
    return response.json({ success: true, message: 'Notification updated successfully', data: { updated: updated } })
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
    if (request.body.hasOwnProperty('title')) {
        update_fields.title = request.body.title
    }
    if (request.body.hasOwnProperty('message')) {
        update_fields.message = request.body.message
    }

    if (request.body.hasOwnProperty('is_sent')) {
        update_fields.is_sent = request.body.is_sent
    }
    if (request.body.hasOwnProperty('sent_on')) {
        update_fields.sent_on = moment(request.body.sent_on).toDate()
    }

    if (request.body.hasOwnProperty('is_read')) {
        update_fields.is_read = request.body.is_read
    }
    if (request.body.hasOwnProperty('read_on')) {
        update_fields.read_on = moment(request.body.read_on).toDate()
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

// Update message by id
module.exports.delete_by_id = async (request, response) => {
    console.log('Delete message by id: ', request.params.notification_id)

    if (!request.params.notification_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var notification_id = request.params.notification_id;
    var message = await Notification.find_by_id(notification_id)
    if (message == null) {
        return response.json({ success: false, message: 'Notification not found', data: {} })
    }

    var deleted = await Notification.delete_by_id(notification_id)
    return response.json({ success: true, message: 'Notification deleted successfully.', data: { deleted: deleted } })
}

