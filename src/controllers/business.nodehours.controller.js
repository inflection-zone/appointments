const BusinessNode = require('../models/business.node.model.js')
const BusinessNodeHours = require('../models/business.nodehours.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new node-hours for business: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.type ||
        !request.body.day
        ) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    const business_node_id = request.body.business_node_id;
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var existing = await exists(request.body);
    if(existing != null)
    {
        return response.json({ success: false, message: 'Business node-hours with same characteristics found, please use update!', data: { existing: existing } })
    }

    var new_node_hours = {}
    new_node_hours.business_node_id = request.body.business_node_id
    new_node_hours.type = request.body.type
    new_node_hours.day = request.body.day
    new_node_hours.date = request.body.date ? moment(request.body.date).toDate() : null
    new_node_hours.is_open = request.body.is_open ? request.body.is_open : true
    new_node_hours.message = request.body.message ? request.body.message : null
    new_node_hours.start_time = request.body.start_time ? request.body.start_time : '10:00:00'
    new_node_hours.end_time = request.body.end_time ? request.body.end_time : '21:00:00'
    new_node_hours.is_active = request.body.is_active ? request.body.is_active : true

    var node_hours = await BusinessNodeHours.create(new_node_hours)

    return response.json({ success: true, message: 'Business node-hours created', data: { node_hours: node_hours } })
}

module.exports.create_multiple = async (request, response) => {
    if (
        !request.body.business_node_id ||
        !request.body.day_wise_working_hours
        ) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    const business_node_id = request.body.business_node_id;
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var day_wise_working_hours = request.body.day_wise_working_hours

    for await(var wh of day_wise_working_hours) {

        var selector = {
            business_node_id: business_node_id,
            day: wh.day,
            is_active: true
        };
        
        var node_hours_list = await BusinessNodeHours.find_all(selector)

        var update_is_open = wh.hasOwnProperty('is_open') ? wh.is_open : true
        var type = "WORK-DAY"
        if(!update_is_open){
            type = "NON-WORKING-DAY"
        }

        if(node_hours_list.length > 0){
            var updates = {}
            updates.type = type
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time: ''
            updates.end_time = wh.end_time != null ? wh.end_time: ''
            updates.is_active = true

            var updated = await BusinessNodeHours.update(node_hours_list[0].id, updates)
        }
        else{
            var updates = {}
            updates.business_node_id = business_node_id
            updates.type = type
            updates.day = wh.day
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time: ''
            updates.end_time = wh.end_time != null ? wh.end_time: ''
            updates.is_active = true
        
            var tmp = await BusinessNodeHours.create(updates)
        }
    }

    var node_hours = await BusinessNodeHours.find_all({
        business_node_id: business_node_id,
        is_active: true
    });
    return response.json({ success: true, message: 'Business node-hours created', data: { node_hours: node_hours } })

}

async function exists(request_body) {

    var date = request_body.date ?  moment(request_body.date).toDate(): null

    var business_node_id = request_body.business_node_id
    var type = request_body.type
    var day = request_body.day
    var date = date

    var selector = {
        business_node_id: business_node_id,
        is_active: true,
        type: { [Op.like]: '%' + type + '%' },
        day: day,
        date: date
    };
    var node_hours = await BusinessNodeHours.find_all(selector);
    if(node_hours.length > 0)
    {
        return node_hours[0]
    }
    return null
}

module.exports.find_all = async (request, response) => {

    console.log('Get all node hours offered by business-node')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    if (business_node_id != null) {
        var business_node = await BusinessNode.find_by_id(business_node_id)
        if(business_node == null) {
            var message = "Business node with id " + business_node_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var selector = {
        is_active: true
    }
    if(business_node_id != null) {
        selector.business_node_id = business_node_id
    }
    var node_hours = await BusinessNodeHours.find_all(selector);

    return response.json({ success: true, message: 'Node hours list', data: { node_hours: node_hours } })
}

module.exports.find_by_id = async (request, response) => {

    var nodehours_id = request.params.nodehours_id
    console.log('Find node-hours by id: ', nodehours_id)
    if (!nodehours_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var node_hours = await BusinessNodeHours.find_by_id(nodehours_id)
    return response.json({ success: true, message: 'Node hours.', data: { node_hours: node_hours } })
}

// Update node-hours by id
module.exports.update = async (request, response) => {

    var nodehours_id = request.params.nodehours_id
    console.log('Update node-hours by id', nodehours_id)

    if (!nodehours_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var node_hours = await BusinessNodeHours.find_by_id(nodehours_id)
    if (!node_hours) {
        return response.json({ success: false, message: 'Node hours not found for provided info.', data: {} })
    }

    var update_fields = get_update_fields(request.body)
    var updated = await BusinessNodeHours.update(nodehours_id, update_fields)
    node_hours = await BusinessNodeHours.find_by_id(nodehours_id)

    return response.json({ success: true, message: 'Node hours updated successfully', data: { node_hours : node_hours } })
}

module.exports.update_multiple = async (request, response) => {

    var business_node_id = request.params.business_node_id
    console.log('Update node-hours for node with id', business_node_id)

    var day_wise_working_hours = request.body.day_wise_working_hours
    if(!day_wise_working_hours){
        return response.json({ success: false, message: 'Missing required data!', data: {} })
    }

    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    for await(var wh of day_wise_working_hours) {

        var selector = {
            business_node_id: business_node_id,
            day: wh.day,
            is_active: true
        };
        
        var node_hours_list = await BusinessNodeHours.find_all(selector)

        var update_is_open = wh.hasOwnProperty('is_open') ? wh.is_open : true
        var type = "WORK-DAY"
        if(!update_is_open){
            type = "NON-WORKING-DAY"
        }

        if(node_hours_list.length > 0){
            var updates = {}
            updates.type = type
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time: ''
            updates.end_time = wh.end_time != null ? wh.end_time: ''
            updates.is_active = true

            var updated = await BusinessNodeHours.update(node_hours_list[0].id, updates)
        }
        else{
            var updates = {}
            updates.business_node_id = business_node_id
            updates.type = type
            updates.day = wh.day
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time: ''
            updates.end_time = wh.end_time != null ? wh.end_time: ''
            updates.is_active = true
        
            var tmp = await BusinessNodeHours.create(updates)
        }
    }

    var node_hours = await BusinessNodeHours.find_all({
        business_node_id: business_node_id,
        is_active: true
    });
    return response.json({ success: true, message: 'Business node-hours updated', data: { node_hours: node_hours } })

}

function get_update_fields(body) {

    var update_fields = {}

    if (body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = body.business_node_id
    }
    if (body.hasOwnProperty('type')) {
        update_fields.type = body.type
    }
    if (body.hasOwnProperty('day')) {
        update_fields.day = body.day
    }
    if (body.hasOwnProperty('date')) {
        update_fields.date = body.date
    }
    if (body.hasOwnProperty('is_open')) {
        update_fields.is_open = body.is_open
    }
    if (body.hasOwnProperty('message')) {
        update_fields.message = body.message
    }
    if (body.hasOwnProperty('start_time')) {
        update_fields.start_time = body.start_time
    }
    if (body.hasOwnProperty('end_time')) {
        update_fields.end_time = body.end_time
    }
    if (body.hasOwnProperty('is_active')) {
        update_fields.is_active = body.is_active
    }
    
    return update_fields
}

// Update node-hours by id
module.exports.delete_by_id = async (request, response) => {

    var nodehours_id = request.params.nodehours_id
    console.log('Delete node-hours by id: ', nodehours_id)
    if (!nodehours_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var deleted = await BusinessNodeHours.delete_by_id(nodehours_id)
    return response.json({ success: true, message: 'node-hours deleted successfully.', data: { deleted: deleted } })
}

