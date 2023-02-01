const BusinessService = require('../models/business.service.model.js')
const Business = require('../models/business.model.js')
const BusinessNode = require('../models/business.node.model.js')
const Appointment = require('../models/appointment.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {
    console.log('Create new service for business: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.name ||
        !request.body.description
    ) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    if(request.body.hasOwnProperty('allow_cancellation') &&  request.body.allow_cancellation == true){
        if(!request.body.cancellation_window || !request.body.cancellation_charges){
            return response.json({ success: false, 
                message: 'Missing required parameters: Cancellation is allowed, please specify cancellation window and cancellation charges.', 
                data: {} });
        }
    }

    if(request.body.hasOwnProperty('send_reminder') &&  request.body.send_reminder == true){
        if(!request.body.reminder_window || !request.body.reminder_type){
            return response.json({ success: false, 
                message: 'Missing required parameters: Sending reminders on appointment status change is opted. Please specify reminder window and reminder type.', 
                data: {} });
        }
    }

    var business_node_id = request.body.business_node_id
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var new_service = {}

    new_service.business_node_id = request.body.business_node_id
    new_service.name = request.body.name
    new_service.description = request.body.description

    new_service.fees = request.body.fees ? request.body.fees : 0.0
    new_service.service_duration = request.body.service_duration ? request.body.service_duration : 0
    new_service.is_taxable = request.body.is_taxable ? request.body.is_taxable : false
    new_service.tax_rate = request.body.tax_rate ? request.body.tax_rate : 0.0
    new_service.prior_booking_window = request.body.prior_booking_window ? request.body.prior_booking_window : '1h'

    new_service.payment_required = request.body.payment_required ? request.body.payment_required : false
    new_service.payment_percent = request.body.payment_percent ? request.body.payment_percent : 0.0
    new_service.send_reminder = request.body.send_reminder ? request.body.send_reminder : false
    new_service.reminder_window = request.body.reminder_window ? request.body.reminder_window : null
    new_service.reminder_type = request.body.reminder_type ? request.body.reminder_type : null

    new_service.allow_cancellation = request.body.allow_cancellation ? request.body.allow_cancellation : false
    new_service.cancellation_window = request.body.cancellation_window ? request.body.cancellation_window : '1h'
    new_service.cancellation_charges = request.body.cancellation_charges ? request.body.cancellation_charges : 0.0

    new_service.enable_loyalty = request.body.enable_loyalty ? request.body.enable_loyalty : true
    new_service.display_service_picture = request.body.display_service_picture ? request.body.display_service_picture : null

    new_service.is_active = request.body.is_active ? request.body.is_active : true

    var service = await BusinessService.create(new_service)

    return response.json({ success: true, message: 'Service created', data: { service: service } })
}

// Find all services offered by given branch of business
module.exports.find_all_by_business = async (request, response) => {
    console.log('Get all services offered by business or given branch of business')

    const business_id = request.params.business_id;
    var business = await Business.find_by_id(business_id)
    if (business == null) {
        return response.json({ success: false, message: 'Invalid business id.', data: {} })
    }

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    const service_name = (typeof request.query.service_name != 'undefined') ? request.query.service_name : null;

    let services = [];

    if (business_node_id == null) {

        //Find the services for whole business if the node id is not specified

        var nodes = await BusinessNode.find_all({ business_id: business_id });
        for await (const node of nodes) {

            var selector = {
                is_active: true,
                business_node_id: node.id
            }
            if (service_name != null) {
                selector.name = { [Op.like]: '%' + service_name + '%' }
            }

            var node_services = await BusinessService.find_all(selector)
            if (node_services.length > 0) {
                var obj = {
                    business_node_id: business_node_id,
                    business_node_services: node_services
                }
                services.push(obj)
            }
        }
    }
    else {
        node = await BusinessNode.find_by_id(business_node_id);

        var selector = {
            is_active: true,
            business_node_id: node.id
        }
        if (service_name != null) {
            selector.name = { [Op.like]: '%' + service_name + '%' }
        }

        var node_services = await BusinessService.find_all({ business_node_id: node.id })
        if (node_services.length > 0) {
            var obj = {
                business_node_id: business_node_id,
                business_node_services: node_services
            }
            services.push(obj)
        }
    }

    return response.json({ success: true, message: 'Service list', data: { services: services } })
}

module.exports.find_all = async (request, response) => {

    console.log('Search all services')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    const service_name = (typeof request.query.service_name != 'undefined') ? request.query.service_name : null;
    var selector = {
        is_active: true,
    }
    if(business_node_id != null){
        selector.business_node_id = business_node_id
    }
    if (service_name != null) {
        selector.name = { [Op.like]: '%' + service_name + '%' }
    }

    let services = await BusinessService.find_all(selector)
    return response.json({ success: true, message: 'Service list', data: { services: services } })
}

// Find service by id
module.exports.find_by_id = async (request, response) => {

    var service_id = request.params.service_id
    console.log('Find service by id: ', service_id)

    if (!service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var service = await BusinessService.find_by_id(service_id)
    return response.json({ success: true, message: 'Service list.', data: { service: service } })
}

// Update service by id
module.exports.update = async (request, response) => {
    console.log('Update service by id')

    var service_id = request.params.service_id
    if (!service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var service = await BusinessService.find_by_id(service_id)
    if (!service) {
        return response.json({ success: false, message: 'Service not found for provided info.', data: {} })
    }

    var update_fields = get_update_fields(request)
    service = await BusinessService.update(service_id, update_fields)

    return response.json({ success: true, message: 'Service profile updated successfully', data: { service: service } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = request.body.business_node_id
    }
    if (request.body.hasOwnProperty('name')) {
        update_fields.name = request.body.name
    }
    if (request.body.hasOwnProperty('description')) {
        update_fields.description = request.body.description
    }
    if (request.body.hasOwnProperty('fees')) {
        update_fields.fees = request.body.fees
    }
    if (request.body.hasOwnProperty('service_duration')) {
        update_fields.service_duration = request.body.service_duration
    }
    if (request.body.hasOwnProperty('is_taxable')) {
        update_fields.is_taxable = request.body.is_taxable
    }
    if (request.body.hasOwnProperty('tax_rate')) {
        update_fields.tax_rate = request.body.tax_rate
    }
    if (request.body.hasOwnProperty('prior_booking_window')) {
        update_fields.prior_booking_window = request.body.prior_booking_window
    }
    if (request.body.hasOwnProperty('payment_required')) {
        update_fields.payment_required = request.body.payment_required
    }
    if (request.body.hasOwnProperty('payment_percent')) {
        update_fields.payment_percent = request.body.payment_percent
    }
    if (request.body.hasOwnProperty('send_reminder')) {
        update_fields.send_reminder = request.body.send_reminder
    }
    if (request.body.hasOwnProperty('reminder_window')) {
        update_fields.reminder_window = request.body.reminder_window
    }
    if (request.body.hasOwnProperty('reminder_type')) {
        update_fields.reminder_type = request.body.reminder_type
    }
    if (request.body.hasOwnProperty('allow_cancellation')) {
        update_fields.allow_cancellation = request.body.allow_cancellation
    }
    if (request.body.hasOwnProperty('cancellation_window')) {
        update_fields.cancellation_window = request.body.cancellation_window
    }
    if (request.body.hasOwnProperty('cancellation_charges')) {
        update_fields.cancellation_charges = request.body.cancellation_charges
    }
    if (request.body.hasOwnProperty('enable_loyalty')) {
        update_fields.enable_loyalty = request.body.enable_loyalty
    }
    if (request.body.hasOwnProperty('display_service_picture')) {
        update_fields.display_service_picture = request.body.display_service_picture
    }
    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }

    return update_fields
}

// Update service by id
module.exports.delete_by_id = async (request, response) => {

    var service_id = request.params.service_id
    console.log('Delete service by id: ', service_id)

    if (!service_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    //Check if any appointments exist

    var appointments = await Appointment.find_all({
        business_service_id: service_id,
        end_time: {
            [Op.gte]: moment.utc().toDate()
        },
        is_active: true,
        is_cancelled: false
    })

    if(appointments.length > 0){
        return response.json({ success: false, message: 'Active appointments for this service exists. Service cannot be deleted.', data: {active_appointments: appointments} })
    }
    
    var deleted = await BusinessService.delete_by_id(service_id)
    return response.json({ success: true, message: 'Service deleted successfully.', data: { deleted: deleted } })

}

