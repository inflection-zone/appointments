const BusinessUser = require('../models/business.user.model.js')
const BusinessUserHours = require('../models/business.userhours.model.js')
const BusinessNodeHours = require('../models/business.nodehours.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new user-hours for business: ', request.body)

    if (
        !request.body.business_user_id ||
        !request.body.type ||
        !request.body.day
    ) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    const business_user_id = request.body.business_user_id;
    var business_user = await BusinessUser.find_by_id(business_user_id)
    if (!business_user) {
        var message = "Business user with id " + business_user_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var existing = await exists(request.body);
    if (existing != null) {
        return response.json({ success: false, message: 'User node-hours with same characteristics found, please use update!', data: { existing: existing } })
    }

    if (request.body.day != null && request.body.date == null) {

        //Compare with node-hours and adjust the time accordingly

        var node_hours_list = await BusinessNodeHours.find_all({
            business_node_id: business_user.business_node_id,
            day: request.body.day,
            date: null,
            is_active: true
        })

        var node_hours_for_day = node_hours_list.length > 0 ? node_hours_list[0] : null
        if (node_hours_for_day != null && request.body.start_time != null && request.body.end_time != null) {

            node_start_time = node_hours_for_day.start_time
            node_end_time = node_hours_for_day.end_time

            if (IsBefore(request.body.start_time, node_start_time)) {
                request.body.start_time = node_start_time
            }
            if (IsAfter(request.body.end_time, node_end_time)) {
                request.body.end_time = node_end_time
            }
        }
    }

    var new_user_hours = {}
    new_user_hours.business_user_id = request.body.business_user_id
    new_user_hours.type = request.body.type
    new_user_hours.day = request.body.day
    new_user_hours.date = request.body.date ? moment(request.body.date).toDate() : null
    new_user_hours.is_open = request.body.is_open ? request.body.is_open : true
    new_user_hours.message = request.body.message ? request.body.message : null
    new_user_hours.start_time = request.body.start_time ? request.body.start_time : '10:00:00'
    new_user_hours.end_time = request.body.end_time ? request.body.end_time : '21:00:00'
    new_user_hours.is_active = request.body.is_active ? request.body.is_active : true

    var user_hours = await BusinessUserHours.create(new_user_hours)

    return response.json({ success: true, message: 'Business user-hours created', data: { user_hours: user_hours } })
}

module.exports.create_multiple = async (request, response) => {

    var business_user_id = request.body.business_user_id
    console.log('Update user-hours for user with id', business_user_id)
    var day_wise_working_hours = request.body.day_wise_working_hours

    if (
        !request.body.business_user_id ||
        !request.body.day_wise_working_hours
    ) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_user = await BusinessUser.find_by_id(business_user_id)
    if (!business_user) {
        var message = "Business user with id " + business_user_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    for await (var wh of day_wise_working_hours) {

        var selector = {
            business_user_id: business_user_id,
            day: wh.day,
            is_active: true
        };

        var user_hours_list = await BusinessUserHours.find_all(selector)

        //Compare with node-hours and adjust the time accordingly

        var node_hours_list = await BusinessNodeHours.find_all({
            business_node_id: business_user.business_node_id,
            day: wh.day,
            date: null,
            is_active: true
        })

        var node_hours_for_day = node_hours_list.length > 0 ? node_hours_list[0] : null
        if (node_hours_for_day != null && wh.start_time != null && wh.end_time != null) {
            node_start_time = node_hours_for_day.start_time
            node_end_time = node_hours_for_day.end_time

            if (IsBefore(wh.start_time, node_start_time)) {
                wh.start_time = node_start_time
            }
            if (IsAfter(wh.end_time, node_end_time)) {
                wh.end_time = node_end_time
            }
        }

        var update_is_open = wh.hasOwnProperty('is_open') ? wh.is_open : true
        var type = "WORK-DAY"
        if (!update_is_open || node_hours_for_day == null) {
            type = "NON-WORKING-DAY"
        }

        if (user_hours_list.length > 0) {
            var updates = {}
            updates.type = type
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time : ''
            updates.end_time = wh.end_time != null ? wh.end_time : ''
            updates.is_active = true

            var updated = await BusinessUserHours.update(user_hours_list[0].id, updates)
        }
        else {
            var updates = {}
            updates.business_user_id = business_user_id
            updates.type = type
            updates.day = wh.day
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time : ''
            updates.end_time = wh.end_time != null ? wh.end_time : ''
            updates.is_active = true

            var tmp = await BusinessUserHours.create(updates)
        }
    }

    var user_hours = await BusinessUserHours.find_all({
        business_user_id: business_user_id,
        is_active: true
    });

    user_hours.sort(function(a, b){ if(a.day != null && b.day != null) return a.day - b.day; return 0});
    
    return response.json({ success: true, message: 'Business user-hours created', data: { user_hours: user_hours } })
}

async function exists(request_body) {

    var date = request_body.date ? moment(request_body.date).toDate() : null

    var business_user_id = request_body.business_user_id
    var type = request_body.type
    var day = request_body.day
    var date = date

    var selector = {
        business_user_id: business_user_id,
        is_active: true,
        day: day,
        date: date
    };
    var user_hours = await BusinessUserHours.find_all(selector);
    if (user_hours.length > 0) {
        return user_hours[0]
    }
    return null
}

module.exports.find_all = async (request, response) => {

    console.log('Get all user hours offered by business-user')

    const business_user_id = (typeof request.query.business_user_id != 'undefined') ? request.query.business_user_id : null;

    if (business_user_id != null) {
        var business_user = await BusinessUser.find_by_id(business_user_id)
        if (business_user == null) {
            var message = "Business user with id " + business_user_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var selector = {
        is_active: true
    }
    if (business_user_id != null) {
        selector.business_user_id = business_user_id
    }
    var user_hours = await BusinessUserHours.find_all(selector);
    user_hours.sort(function(a, b){ if(a.day != null && b.day != null) return a.day - b.day; return 0} );

    return response.json({ success: true, message: 'User hours list', data: { user_hours: user_hours } })
}

module.exports.find_by_id = async (request, response) => {

    var userhours_id = request.params.userhours_id
    console.log('Find user-hours by id: ', userhours_id)
    if (!userhours_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var user_hours = await BusinessUserHours.find_by_id(userhours_id)
    return response.json({ success: true, message: 'User hours.', data: { user_hours: user_hours } })
}

// Update user-hours by id
module.exports.update = async (request, response) => {

    var userhours_id = request.params.userhours_id
    console.log('Update user-hours by id', userhours_id)

    if (!userhours_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var user_hours = await BusinessUserHours.find_by_id(userhours_id)
    if (!user_hours) {
        return response.json({ success: false, message: 'User hours not found for provided info.', data: {} })
    }

    var business_user_id = user_hours.business_user_id
    var business_user = await BusinessUser.find_by_id(business_user_id)
    if (!business_user) {
        var message = "Business user with id " + business_user_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    if (request.body.day != null && request.body.date == null) {

        //Compare with node-hours and adjust the time accordingly
        
        var node_hours_list = await BusinessNodeHours.find_all({
            business_node_id: business_user.business_node_id,
            day: request.body.day,
            date: null,
            is_active: true
        })

        var node_hours_for_day = node_hours_list.length > 0 ? node_hours_list[0] : null
        if (node_hours_for_day != null  && request.body.start_time != null && request.body.end_time != null) {

            node_start_time = node_hours_for_day.start_time
            node_end_time = node_hours_for_day.end_time

            if (IsBefore(request.body.start_time, node_start_time)) {
                request.body.start_time = node_start_time
            }
            if (IsAfter(request.body.end_time, node_end_time)) {
                request.body.end_time = node_end_time
            }
        }
    }

    var update_fields = get_update_fields(request)
    var updated = await BusinessUserHours.update(userhours_id, update_fields)
    user_hours = await BusinessUserHours.find_by_id(userhours_id)

    return response.json({ success: true, message: 'User hours updated successfully', data: { user_hours: user_hours } })
}

///api/business-user-hours/update-multiple/:business_user_id'
module.exports.update_multiple = async (request, response) => {

    var business_user_id = request.params.business_user_id
    console.log('Update user-hours for user with id', business_user_id)

    var day_wise_working_hours = request.body.day_wise_working_hours
    if (!day_wise_working_hours) {
        return response.json({ success: false, message: 'Missing required data!', data: {} })
    }

    var business_user = await BusinessUser.find_by_id(business_user_id)
    if (!business_user) {
        var message = "Business user with id " + business_user_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    for await (var wh of day_wise_working_hours) {

        var selector = {
            business_user_id: business_user_id,
            day: wh.day,
            is_active: true
        };
        var user_hours_list = await BusinessUserHours.find_all(selector)

        //Compare with node-hours and adjust the time accordingly
        var node_hours_list = await BusinessNodeHours.find_all({
            business_node_id: business_user.business_node_id,
            day: wh.day,
            date: null,
            is_active: true
        })

        var node_hours_for_day = node_hours_list.length > 0 ? node_hours_list[0] : null
        if (node_hours_for_day != null && wh.start_time != null && wh.end_time != null) {
            node_start_time = node_hours_for_day.start_time
            node_end_time = node_hours_for_day.end_time

            if (IsBefore(wh.start_time, node_start_time)) {
                wh.start_time = node_start_time
            }
            if (IsAfter(wh.end_time, node_end_time)) {
                wh.end_time = node_end_time
            }
        }

        var update_is_open = wh.hasOwnProperty('is_open') ? wh.is_open : true
        var type = "WORK-DAY"
        if (!update_is_open || node_hours_for_day == null) {
            type = "NON-WORKING-DAY"
        }

        if (user_hours_list.length > 0) {
            var updates = {};
            updates.type = type;
            updates.date = null;
            updates.is_open = update_is_open;
            updates.message = null;
            updates.start_time = wh.start_time != null ? wh.start_time : ''
            updates.end_time = wh.end_time != null ? wh.end_time : ''
            updates.is_active = true;

            var updated = await BusinessUserHours.update(user_hours_list[0].id, updates)
        }
        else {
            var updates = {}
            updates.business_user_id = business_user_id
            updates.type = type
            updates.day = wh.day
            updates.date = null
            updates.is_open = update_is_open
            updates.message = null
            updates.start_time = wh.start_time != null ? wh.start_time : ''
            updates.end_time = wh.end_time != null ? wh.end_time : ''
            updates.is_active = true

            var user_hours = await BusinessUserHours.create(updates)
        }
    }

    var user_hours_list = await BusinessUserHours.find_all({
        business_user_id: business_user_id,
        is_active: true
    });

    user_hours_list.sort(function(a, b){ if(a.day != null && b.day != null) return a.day - b.day; return 0} );

    return response.json({ success: true, message: 'Business user-hours updated', data: { user_hours: user_hours_list } })
}

function IsBefore(a, b) {

    var tokens = a.split(":")
    var a_moment = moment().add(tokens[0], 'hours').add(tokens[1], 'minutes')

    tokens = b.split(":")
    var b_moment = moment().add(tokens[0], 'hours').add(tokens[1], 'minutes')

    if (a_moment.isBefore(b_moment)) {
        return true;
    }
    return false;
}

function IsAfter(a, b) {

    var tokens = a.split(":")
    var a_moment = moment().add(tokens[0], 'hours').add(tokens[1], 'minutes')

    tokens = b.split(":")
    var b_moment = moment().add(tokens[0], 'hours').add(tokens[1], 'minutes')

    if (a_moment.isAfter(b_moment)) {
        return true;
    }
    return false;
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_user_id')) {
        update_fields.business_user_id = request.body.business_user_id
    }
    if (request.body.hasOwnProperty('type')) {
        update_fields.type = request.body.type
    }
    if (request.body.hasOwnProperty('day')) {
        update_fields.day = request.body.day
    }
    if (request.body.hasOwnProperty('date')) {
        update_fields.date = request.body.date
    }
    if (request.body.hasOwnProperty('is_open')) {
        update_fields.is_open = request.body.is_open
    }
    if (request.body.hasOwnProperty('message')) {
        update_fields.message = request.body.message
    }
    if (request.body.hasOwnProperty('start_time')) {
        update_fields.start_time = request.body.start_time
    }
    if (request.body.hasOwnProperty('end_time')) {
        update_fields.end_time = request.body.end_time
    }
    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }

    return update_fields
}

// Update user-hours by id
module.exports.delete_by_id = async (request, response) => {

    var userhours_id = request.params.userhours_id
    console.log('Delete user-hours by id: ', userhours_id)
    if (!userhours_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var deleted = await BusinessUserHours.delete_by_id(userhours_id)
    return response.json({ success: true, message: 'user-hours deleted successfully.', data: { deleted: deleted } })
}

