const Business = require('../models/business.model.js')
const BusinessNode = require('../models/business.node.model.js')
const BusinessNodeHours = require('../models/business.nodehours.model.js')
const Op = require('sequelize').Op;

module.exports.create = async (request, response) => {

    console.log('Create new node for business: ', request.body)

    if (
        !request.body.business_id ||
        !request.body.name ||
        !request.body.mobile ||
        !request.body.email ||
        !request.body.address) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_id = request.body.business_id
    var business = await Business.find_by_id(business_id)
    if (!business) {
        var message = "Business with id " + business_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    // Check if business already exist with same mobile
    var mobile = request.body.mobile
    var business_node = await BusinessNode.find_by_mobile(mobile)
    if (business_node) {
        console.log("Business node with email already exist: ", mobile, " Id: ", business_node.id)
        return response.json({ success: false, message: 'Business node already exists with mobile number: ' + mobile, data: {} })
    }

    // Check if business already exist with same email
    var email = request.body.email
    business_node = await BusinessNode.find_by_email(email)
    if (business_node) {
        console.log("Business node with email already exist: ", email, " Id: ", business_node.id)
        return response.json({ success: false, message: 'Business node already exists with email id: ' + email, data: {} })
    }    

    var new_node = {}

    new_node.business_id = request.body.business_id
    new_node.name = request.body.name
    new_node.mobile = request.body.mobile
    new_node.email = request.body.email
    new_node.address = request.body.address

    new_node.time_zone = request.body.time_zone ? request.body.time_zone : "+05:30"

    new_node.display_picture = request.body.display_picture ? request.body.display_picture : null
    new_node.allow_walkin_appointments = request.body.allow_walkin_appointments ? request.body.allow_walkin_appointments : true
    new_node.allow_future_booking_for = request.body.allow_future_booking_for ? request.body.allow_future_booking_for : '30d'

    new_node.longitude = request.body.longitude ? request.body.longitude : null
    new_node.lattitude = request.body.lattitude ? request.body.lattitude : null

    new_node.is_active = true

    var node = await BusinessNode.create(new_node)
    var default_service_hours = await BusinessNodeHours.create_default_hours_for_node(node)
    return response.json({ success: true, message: 'Business node created', data: { 
        node: node,
        default_service_hours: default_service_hours
    } })
}

module.exports.find_all = async (request, response) => {
    console.log('Get all nodes offered by business')

    var selector = {
        is_active: true
    }

    const business_id = (typeof request.query.business_id != 'undefined') ? request.query.business_id : null;
    if (business_id != null) {
        selector.business_id = business_id
    }
    const node_name = (typeof request.query.node_name != 'undefined') ? request.query.node_name : null;
    if (node_name != null) {
        selector.name = { [Op.like]: '%' + node_name + '%' }
    }

    var nodes = await BusinessNode.find_all(selector);

    return response.json({ success: true, message: 'Node list', data: { nodes: nodes } })
}

module.exports.find_by_id = async (request, response) => {

    var node_id = request.params.node_id
    console.log('Find node by id: ', node_id)
    if (!node_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var node = await BusinessNode.find_by_id(node_id)
    return response.json({ success: true, message: 'Node list.', data: { node: node } })
}

// Update node by id
module.exports.update = async (request, response) => {
    console.log('Update node by id')

    var node_id = request.params.node_id
    if (!node_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var node = await BusinessNode.find_by_id(node_id)
    if (!node) {
        return response.json({ success: false, message: 'Node not found for provided info.', data: {} })
    }

    if (request.body.hasOwnProperty('mobile')) {
        var mobile = request.body.mobile
        var other_entity = await BusinessNode.find_by_mobile(mobile)
        if (other_entity != null && other_entity.id != node.id) {
            console.log("Business node with email already exist: ", mobile, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Business node already exists with mobile number: ' + mobile, data: {} })
        }
    }
    if (request.body.hasOwnProperty('email')) {
        var email = request.body.email
        var other_entity = await BusinessNode.find_by_email(email)
        if (other_entity != null && other_entity.id != node.id) {
            console.log("Business node with email already exist: ", email, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Business node already exists with email id: ' + email, data: {} })
        }
    }

    var update_fields = get_update_fields(request)
    var updated = await BusinessNode.update(node_id, update_fields)
    node = await BusinessNode.find_by_id(node_id)

    return response.json({ success: true, message: 'Node profile updated successfully', data: { node: node } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_id')) {
        update_fields.business_id = request.body.business_id
    }
    if (request.body.hasOwnProperty('name')) {
        update_fields.name = request.body.name
    }
    if (request.body.hasOwnProperty('mobile')) {
        update_fields.mobile = request.body.mobile
    }
    if (request.body.hasOwnProperty('email')) {
        update_fields.email = request.body.email
    }
    if (request.body.hasOwnProperty('display_picture')) {
        update_fields.display_picture = request.body.display_picture
    }
    if (request.body.hasOwnProperty('address')) {
        update_fields.address = request.body.address
    }
    if (request.body.hasOwnProperty('longitude')) {
        update_fields.longitude = request.body.longitude
    }
    if (request.body.hasOwnProperty('lattitude')) {
        update_fields.lattitude = request.body.lattitude
    }
    if (request.body.hasOwnProperty('time_zone')) {
        update_fields.time_zone = request.body.time_zone
    }
    if (request.body.hasOwnProperty('allow_walkin_appointments')) {
        update_fields.allow_walkin_appointments = request.body.allow_walkin_appointments
    }
    if (request.body.hasOwnProperty('allow_future_booking_for')) {
        update_fields.allow_future_booking_for = request.body.allow_future_booking_for
    }
    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    
    return update_fields
}

// Update node by id
module.exports.delete_by_id = async (request, response) => {

    var node_id = request.params.node_id
    console.log('Delete node by id: ', node_id)

    if (!node_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var deleted = await BusinessNode.delete_by_id(node_id)
    return response.json({ success: true, message: 'node deleted successfully.', data: { deleted: deleted } })

}

