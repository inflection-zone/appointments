const BusinessUserService = require('../models/business.user.service.model.js')
const BusinessUser = require('../models/business.user.model.js')
const BusinessService = require('../models/business.service.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new user service: ', request.body)

    if (
        !request.body.business_user_id ||
        !request.body.business_service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_user_id = request.body.business_user_id
    var business_user = await BusinessUser.find_by_id(business_user_id)
    if (!business_user) {
        var message = "Business user with id " + business_user_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }
    var business_service_id = request.body.business_service_id
    var business_user_service = await BusinessService.find_by_id(business_service_id)
    if (!business_user_service) {
        var message = "Business service with id " + business_service_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var existing = await BusinessUserService.find_all({
        business_user_id: business_user_id, 
        business_service_id: business_service_id
    })
    if(existing.length > 0)
    {
        var message = "Business service with service id " + 
            business_service_id.toString() + " and user id " + + business_user_id.toString() + " already exists!";
        console.log(message);
        return response.json({ success: false, message: message, data: {existing: existing[0]} });
    }

    var new_user_service = {}
    new_user_service.business_user_id = request.body.business_user_id
    new_user_service.business_service_id = request.body.business_service_id
    new_user_service.is_active = request.body.is_active ? request.body.is_active : true

    var service = await BusinessUserService.create(new_user_service)

    return response.json({
        success: true, message: 'User service created', data: {
            service: service,
        }
    })
}

module.exports.create_multiple = async (request, response) => {

    console.log('Create new user services: ', request.body)

    if (
        !request.body.services || request.body.services.length == 0) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {services: request.body.services} })
    }

    var services = []
    var new_user_services = request.body.services

    var alreadyExists = false;
    var warning_messages = [];

    for await (const s of new_user_services) {
        var business_user_id = s.business_user_id

        var business_user = await BusinessUser.find_by_id(business_user_id)
        if (!business_user) {
            var message = "Business user with id " + business_user_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }

        var business_service_id = s.business_service_id
        var business_user_service = await BusinessService.find_by_id(business_service_id)
        if (!business_user_service) {
            var message = "Business service with id " + business_service_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
        //Check for existing...
        var existing = await BusinessUserService.find_all({
            business_user_id: business_user_id,
            business_service_id: business_service_id
        })
        if (existing.length > 0) {
            alreadyExists = true;
            var message = "User service with service id " + 
            business_service_id.toString() + " and user id " + + business_user_id.toString() + " already exists!";
            warning_messages.push(message)
            continue;
        }
        var new_user_service = {}
        new_user_service.business_user_id = s.business_user_id
        new_user_service.business_service_id = s.business_service_id
        new_user_service.is_active = s.is_active ? s.is_active : true

        var service = await BusinessUserService.create(new_user_service)
        services.push(service)
    }

    if(!alreadyExists){
        return response.json({
            success: true, message: services.length.toString() + ' user services created', data: {
                services: services
            }
        })
    }
    else {
        return response.json({
            success: true, message: services.length.toString() + ' user services created', data: {
                services: services,
                warning_messages: warning_messages
            }
        })
    }
}

module.exports.find_all = async (request, response) => {
    console.log('Get all user services')

    const user_id = (typeof request.query.user_id != 'undefined') ? request.query.user_id : null;
    const service_id = (typeof request.query.service_id != 'undefined') ? request.query.service_id : null;

    if (user_id != null) {
        var business_user = await BusinessUser.find_by_id(user_id)
        if (business_user == null) {
            var message = "Business node with id " + user_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }
    if (service_id != null) {
        var business_user_service = await BusinessService.find_by_id(service_id)
        if (!business_user_service) {
            var message = "Business service with id " + service_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }
    var selector = {
        is_active: true
    }
    if (user_id != null) {
        selector.business_user_id = user_id
    }
    if (service_id != null) {
        selector.business_service_id = service_id
    }

    var user_services = await BusinessUserService.find_all(selector);

    return response.json({ success: true, message: 'User user_services list', data: { user_services: user_services } })
}

module.exports.find_by_id = async (request, response) => {

    var user_service_id = request.params.user_service_id
    console.log('Find user by id: ', user_service_id)

    if (!user_service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var service = await BusinessUserService.find_by_id(user_service_id)
    return response.json({ success: true, message: 'User service', data: { service: service } })
}

module.exports.update = async (request, response) => {
    console.log('Update service by id')

    if (!request.params.user_service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var user_service_id = request.params.user_service_id;
    var service = await BusinessUserService.find_by_id(user_service_id)
    if (service == null) {
        return response.json({ success: false, message: 'User service not found', data: {} })
    }

    if (request.body.hasOwnProperty('business_user_id')) {
        var business_user_id = request.body.business_user_id
        var business_user = await BusinessUser.find_by_id(business_user_id)
        if (!business_user) {
            var message = "Business user with id " + business_user_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }
    if (request.body.hasOwnProperty('business_service_id')) {
        var business_service_id = request.body.business_service_id
        var business_user_service = await BusinessService.find_by_id(business_service_id)
        if (!business_user_service) {
            var message = "Business service with id " + business_service_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var update_fields = get_update_fields(request)

    if(update_fields.business_user_id && update_fields.business_service_id)
    {
        var existing = await BusinessUserService.find_all({
            business_user_id: update_fields.business_user_id, 
            business_service_id: update_fields.business_service_id
        })
        if(existing.length > 0)
        {
            var message = "Business service with service id " + 
                business_service_id.toString() + " and user id " + + business_user_id.toString() + " already exists!";
            console.log(message);
            return response.json({ success: false, message: message, data: {existing: existing[0]} });
        }
    }

    var updated = await BusinessUserService.update(user_service_id, update_fields)
    service = await BusinessUserService.find_by_id(user_service_id)

    return response.json({ success: true, message: 'User service updated successfully', data: { service: service } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_user_id')) {
        update_fields.business_user_id = request.body.business_user_id
    }
    if (request.body.hasOwnProperty('business_service_id')) {
        update_fields.business_service_id = request.body.business_service_id
    }
    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

module.exports.delete_by_id = async (request, response) => {
    console.log('Delete service by id: ', request.params.user_service_id)

    if (!request.params.user_service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var user_service_id = request.params.user_service_id;
    var service = await BusinessUserService.find_by_id(user_service_id)
    if (service == null) {
        return response.json({ success: false, message: 'User service not found', data: {} })
    }

    var deleted = await BusinessUserService.delete_by_id(user_service_id)
    return response.json({ success: true, message: 'User service deleted successfully.', data: { deleted: deleted } })
}

