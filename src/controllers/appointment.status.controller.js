const BusinessNode = require('../models/business.node.model.js')
const AppointmentStatus = require('../models/appointment.status.model.js')

module.exports.create = async (request, response) => {

    console.log('Create new appointment status: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.status ||
        !request.body.status_code ||
        !request.body.status_color ||
        !request.body.sequence) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_node_id = request.body.business_node_id
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var existing_statuses = await AppointmentStatus.find_all({sequence: request.body.sequence, business_node_id: business_node_id});
    if(existing_statuses.length > 0){
        return response.json({ success: false, message: 'Appointment status with the same sequence for the same business node exists.', data: {} })
    }

    var new_appointment_status = {}
    new_appointment_status.business_node_id = request.body.business_node_id
    new_appointment_status.status = request.body.status
    new_appointment_status.status_code = request.body.status_code
    new_appointment_status.status_color = request.body.status_color
    new_appointment_status.sequence = request.body.sequence
    new_appointment_status.send_notification = request.body.send_notification ? request.body.send_notification : true
    new_appointment_status.notification_text = request.body.notification_text ? request.body.notification_text : null
    new_appointment_status.send_sms = request.body.send_sms ? request.body.send_sms : true
    new_appointment_status.sms_text = request.body.sms_text ? request.body.sms_text : null
    new_appointment_status.is_dashboard_status = request.body.is_dashboard_status ? request.body.is_dashboard_status : true
    new_appointment_status.is_completed_status = request.body.is_completed_status ? request.body.is_completed_status : false
    new_appointment_status.is_confirmed_status =  request.body.is_confirmed_status ? request.body.is_confirmed_status : false
    new_appointment_status.is_cancellation_status = request.body.is_cancellation_status ? request.body.is_cancellation_status : false
    new_appointment_status.is_walkin_entry_status = request.body.is_walkin_entry_status ? request.body.is_walkin_entry_status : false
    new_appointment_status.is_active = request.body.is_active ? request.body.is_active : true

    var status = await AppointmentStatus.create(new_appointment_status)

    return response.json({ success: true, message: 'Appointment status created', data: { 
        status: status
     } })
}

module.exports.create_multiple = async (request, response) => {

    if (
        !request.body.business_node_id ||
        !request.body.statuses) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var statuses = request.body.statuses
    var business_node_id = request.body.business_node_id
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    for await (var s of statuses) {

        var selector = {
            business_node_id: business_node_id,
            status_code: s.status_code,
            sequence: s.sequence,
            is_active: true
        };
        var existing = await AppointmentStatus.find_all(selector)

        if (existing.length > 0) {
            var updates = get_update_fields(s)
            var updated = await AppointmentStatus.update(existing[0].id, updates)
        }
        else {
            var updates = {}
            updates.business_node_id = business_node_id
            updates.status = s.status
            updates.status_code = s.status_code
            updates.status_color = s.status_color
            updates.sequence = s.sequence
            updates.send_notification = s.send_notification ? s.send_notification : true
            updates.notification_text = s.notification_text ? s.notification_text : null
            updates.send_sms = s.send_sms ? s.send_sms : true
            updates.sms_text = s.sms_text ? s.sms_text : null
            updates.is_dashboard_status = s.is_dashboard_status ? s.is_dashboard_status : true
            updates.is_completed_status = s.is_completed_status ? s.is_completed_status : false
            updates.is_confirmed_status = s.is_confirmed_status ? s.is_confirmed_status : false
            updates.is_cancellation_status = s.is_cancellation_status ? s.is_cancellation_status : false
            updates.is_walkin_entry_status = s.is_walkin_entry_status ? s.is_walkin_entry_status : false
            updates.is_active = s.is_active ? s.is_active : true
        
            var status = await AppointmentStatus.create(updates)
        }
    }

    var appointment_statuses = await AppointmentStatus.find_all({
        business_node_id: business_node_id,
        is_active: true
    });

    appointment_statuses.sort(function(a, b){ if(a.sequence != null && b.sequence != null) return a.sequence - b.sequence; return 0});
    
    return response.json({ success: true, message: 'Appointment statuses updated/created', data: { appointment_statuses: appointment_statuses } })
}

// Get all statuses
module.exports.find_all = async (request, response) => {
    console.log('Get all statuses')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;

    var selector = {}
    if (business_node_id != null) {
        selector.business_node_id = business_node_id
    }
    var statuses = await AppointmentStatus.find_all(selector)

    return response.json({ success: true, message: 'Appointment status list', data: { statuses: statuses } })
}

// Find status by id
module.exports.find_by_id = async (request, response) => {

    var status_id = request.params.status_id
    console.log('Find status by id: ', status_id)

    if (!status_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var status = await AppointmentStatus.find_by_id(status_id)
    return response.json({ success: true, message: 'status', data: { status: status } })
}

// Update status by id
module.exports.update = async (request, response) => {
    console.log('Update status by id')

    if (!request.params.status_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var status_id = request.params.status_id;
    var status = await AppointmentStatus.find_by_id(status_id)
    if(status == null){
        return response.json({ success: false, message: 'Status not found', data: {} })
    }

    if (request.body.hasOwnProperty('sequence')) {
        var existing_statuses = await AppointmentStatus.find_all({
            sequence: request.body.sequence, 
            business_node_id: status.business_node_id
        });
        if(existing_statuses.length > 0){
            for(var s of existing_statuses){
                if(s.id != status_id){
                    return response.json({ success: false, 
                        message: 'Appointment status with the same sequence for the same business node exists.', 
                        data: {} });
                }
            }
        }
    }

    var update_fields = get_update_fields(request.body)
    var updated = await AppointmentStatus.update(status_id, update_fields)
    var status = await AppointmentStatus.find_by_id(status_id)
    return response.json({ success: true, message: 'Status updated successfully', data: { status: status } })
}

function get_update_fields(body) {

    var update_fields = {}

    if (body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = body.business_node_id
    }
    if (body.hasOwnProperty('status')) {
        update_fields.status = body.status
    }
    if (body.hasOwnProperty('status_code')) {
        update_fields.status_code = body.status_code
    }
    if (body.hasOwnProperty('status_color')) {
        update_fields.status_color = body.status_color
    }
    if (body.hasOwnProperty('sequence')) {
        update_fields.sequence = body.sequence
    }
    if (body.hasOwnProperty('send_notification')) {
        update_fields.send_notification = body.send_notification
    }
    if (body.hasOwnProperty('notification_text')) {
        update_fields.notification_text = body.notification_text
    }
    if (body.hasOwnProperty('send_sms')) {
        update_fields.send_sms = body.send_sms
    }
    if (body.hasOwnProperty('sms_text')) {
        update_fields.sms_text = body.sms_text
    }
    if (body.hasOwnProperty('is_dashboard_status')) {
        update_fields.is_dashboard_status = body.is_dashboard_status
    }
    if (body.hasOwnProperty('is_completed_status')) {
        update_fields.is_completed_status = body.is_completed_status
    }
    if (body.hasOwnProperty('is_cancellation_status')) {
        update_fields.is_cancellation_status = body.is_cancellation_status
    }
    if (body.hasOwnProperty('is_confirmed_status')) {
        update_fields.is_confirmed_status = body.is_confirmed_status
    }
    if (body.hasOwnProperty('is_walkin_entry_status')) {
        update_fields.is_walkin_entry_status = body.is_walkin_entry_status
    }
    if (body.hasOwnProperty('is_active')) {
        update_fields.is_active = body.is_active
    }
    return update_fields
}

// Delete status by id
module.exports.delete_by_id = async (request, response) => {
    console.log('Delete status by id: ', service_id)
    
    if (!request.params.status_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var status_id = request.params.status_id;
    var status = await AppointmentStatus.find_by_id(status_id)
    if(status == null){
        return response.json({ success: false, message: 'Status not found', data: {} })
    }

    var deleted = await AppointmentStatus.delete_by_id(status_id)
    return response.json({ success: true, message: 'Status deleted successfully.', data: { deleted: deleted } })
}

