const BusinessUser = require('../models/business.user.model.js')
const Business = require('../models/business.model.js')
const BusinessNode = require('../models/business.node.model.js')
const UserService = require('../models/business.user.service.model.js')
const Customer = require('../models/customer.model.js')
const Appointment = require('../models/appointment.model.js')
const AppointmentStatus = require('../models/appointment.status.model.js')
const NodeHours = require('../models/business.nodehours.model.js')
const UserHours = require('../models/business.userhours.model.js')
const BusinessService = require('../models/business.service.model.js')
const BusinessUserService = require('../models/business.user.service.model.js')
const BusinessNodeCustomer = require('../models/business.node.customer.model.js')
const _ = require('lodash')

var moment = require('moment-business-days');
const appointment_status = require('../models/entities/appointment_status.js')
const Op = require('sequelize').Op;

// Find available appointment slots

module.exports.find_available_slots = async (request, response) => {
    console.log('Find available appointment slot: ', request.body)

    const business_id = request.params.business_id;
    var business = await Business.find_by_id(business_id)
    if(business == null)
    {
        return response.json({ success: false, message: 'Invalid business id.', data: {} })
    }

    const node_id = request.params.node_id;
    var node = await BusinessNode.find_by_id(node_id)
    if(node == null)
    {
        return response.json({ success: false, message: 'Invalid node id.', data: {} })
    }

    const service_id = request.params.service_id;
    var service = await BusinessService.find_by_id(service_id)
    if(service == null)
    {
        return response.json({ success: false, message: 'Invalid service id.', data: {} })
    }

    //update the work-days
    var node_hours = await NodeHours.find_all({ business_node_id: node_id })
    if(node_hours.length == 0){
        return response.json({ success: false, message: 'Working hours are not specified for the business.', data: {} })
    }

    var num_days_for_slots = parse_duration_in_days(node.allow_future_booking_for)

    var time_zone = node.time_zone

    const from_date = (typeof request.query.from_date != 'undefined') ? request.query.from_date : null;
    const to_date = (typeof request.query.to_date != 'undefined') ? request.query.to_date : null;

    var start_date = moment.utc().startOf("day")
    if(from_date != null){
        var dt = new Date(from_date)
        start_date = moment.utc(dt).startOf("day")
    }
    var max_allowable = moment.utc().startOf("day").add(num_days_for_slots, 'days')
    var end_date = moment.utc().startOf("day").add(7, 'days')
    if(to_date != null){
        var dt = new Date(to_date)
        end_date = moment.utc(dt).startOf("day")
        if(end_date.isAfter(max_allowable)){
            end_date = max_allowable
        }
    }
    // console.log(start_date.format())
    // console.log(end_date.format())
    // console.log(max_allowable.format())

    var slots = []

    var user_id = (typeof request.query.user_id != 'undefined') ? request.query.user_id : null;

    if(user_id != null){

        //User is specified
        var user_hours = []
        var user = await BusinessUser.find_by_id(user_id)
        if(user == null)
        {
            return response.json({ success: false, message: 'Invalid user id.', data: {} })
        }
        user_hours = await UserHours.find_all({business_user_id:user_id})
        if(user_hours.length == 0){
            return response.json({ success: false, message: 'Working hours are not specified for the business user.', data: {} })
        }
        var available_slots_by_date = await find_slot_availability(time_zone, num_days_for_slots, start_date, end_date, node_hours, user_hours, user_id, service, node_id)
        var user_slots = transform(time_zone, available_slots_by_date)
        var obj = {
            user: user,
            available_slots: user_slots
        }

        slots.push(obj)
    }
    else{

        //User is not specified, check all users performing this service

        var user_services = await BusinessUserService.find_all({business_service_id: service_id})
        if(user_services.length == 0){
            //Users for this service are not found, calculate slots based on only node hours
            var user_hours = []
            var available_slots_by_date = await find_slot_availability(time_zone, num_days_for_slots, start_date, end_date, node_hours, user_hours, null, service, node_id)
            slots = transform(time_zone, available_slots_by_date)
        }
        else{
            
            //For each user providing this service

            for await(var s of user_services){
                user_id = s.business_user_id
                var user_hours = []
                var user = await BusinessUser.find_by_id(user_id)
                if(user == null)
                {
                    return response.json({ success: false, message: 'Invalid user id.', data: {} })
                }
                user_hours = await UserHours.find_all({business_user_id:user_id})
                if(user_hours.length == 0){
                    return response.json({ success: false, message: 'Working hours are not specified for the business user.', data: {} })
                }
                var available_slots_by_date = await find_slot_availability(time_zone, num_days_for_slots, start_date, end_date, node_hours, user_hours, user_id, service, node_id)
                var user_slots = transform(time_zone, available_slots_by_date)
                var obj = {
                    user: user,
                    available_slots: user_slots
                }
                slots.push(obj)
            }
        }
    }

    return response.json({ success: true, message: 'Slot list', data: { slots: slots } })
}

module.exports.find_available_slots_for_user = async (request, response) => {
    console.log('Find available appointment slot for a given business user: ', request.body)

    var user_hours = []
    const user_id = request.params.user_id;
    var user = await BusinessUser.find_by_id(user_id);
    if(user == null){
        return response.json({ success: false, message: 'Invalid user id.', data: {} })
    }

    var business_node_id = user.business_node_id;
    var node = await BusinessNode.find_by_id(business_node_id)
    if(node == null)
    {
        return response.json({ success: false, message: 'Invalid node id found for the user.', data: {} })
    }

    var node_hours = await NodeHours.find_all({ business_node_id: business_node_id })
    if(node_hours.length == 0){
        return response.json({ success: false, message: 'Working hours are not specified for the business.', data: {} })
    }

    var user_hours = await UserHours.find_all({ business_user_id: user_id })
    if (user_hours.length == 0) {
        return response.json({ success: false, message: 'Working hours are not specified for the business user.', data: {} })
    }
    
    var user_services = await UserService.find_all({business_user_id: user_id})
    if(user_services.length == 0)
    {
        return response.json({ success: false, message: 'No services found for the user', data: {} })
    }
    var user_service = user_services[0];
    var service_id = user_service.business_service_id;
    var service = await BusinessService.find_by_id(service_id)
    if(service == null)
    {
        return response.json({ success: false, message: 'No services found for the user', data: {} })
    }

    var time_zone = node.time_zone
    var num_days_for_slots = parse_duration_in_days(node.allow_future_booking_for)

    const from_date = (typeof request.query.from_date != 'undefined') ? request.query.from_date : null;
    const to_date = (typeof request.query.to_date != 'undefined') ? request.query.to_date : null;

    var start_date = moment.utc().startOf("day")
    if(from_date != null){
        var dt = new Date(from_date)
        start_date = moment.utc(dt).startOf("day")
    }
    var max_allowable = moment.utc().startOf("day").add(num_days_for_slots, 'days')
    var end_date = moment.utc().startOf("day").add(7, 'days')
    if(to_date != null){
        var dt = new Date(to_date)
        end_date = moment.utc(dt).startOf("day")
        if(end_date.isAfter(max_allowable)){
            end_date = max_allowable
        }
    }

    var available_slots_by_date = await find_slot_availability(time_zone, num_days_for_slots, start_date, end_date, node_hours, user_hours, user_id, service, business_node_id)
    var slots = transform(time_zone, available_slots_by_date)

    return response.json({ success: true, message: 'Slot list', data: { slots: slots } })
}

module.exports.can_customer_book_this_slot = async (request, response) => {
    console.log('Check if a customer can book this slot: ', request.body)
    try{
        if (!request.body.customer_id ||
            !request.body.start_time ||
            !request.body.end_time) {
            return response.json({ success: false, message: 'Missing required data.', data: {} })
        }
        var customer = await Customer.find_by_id(request.body.customer_id)
        if (customer == null) {
            return response.json({ success: false, message: 'Customer not found.', data: {} })
        }
        var start_time = request.body.start_time
        var end_time = request.body.end_time
        var result = await can_customer_book_this_slot(request.body.customer_id, start_time, end_time)
        return response.json({ success: true, message: 'Checked slot conflict successfully.', data: result })
    }
    catch(error){
        return response.json({ success: false, message: 'Unable to check slot conflict successfully.', data: null })
    }
}

module.exports.book_appointment = async (request, response) => {
    console.log('Book a new appointment: ', request.body)

    if (!request.body.business_node_id ||
        !request.body.customer_id ||
        !request.body.business_user_id ||
        !request.body.business_service_id ||
        !request.body.start_time ||
        !request.body.end_time) {
        return response.json({ success: false, message: 'Incomplete information to book an appointment.', data: {} })
    }
    if(moment.utc(request.body.end_time).isBefore(moment.utc())){
        return response.json({ success: false, message: 'Cannot book appointment for the past duration.', data: {} })
    }
    const node_id = request.body.business_node_id;
    var node = await BusinessNode.find_by_id(node_id)
    if (node == null) {
        return response.json({ success: false, message: 'Invalid node id.', data: {} })
    }
    const service_id = request.body.business_service_id;
    var service = await BusinessService.find_by_id(service_id)
    if (service == null) {
        return response.json({ success: false, message: 'Invalid service id.', data: {} })
    }

    //update the work-days
    var node_hours = await NodeHours.find_all({ business_node_id: node_id })
    if (node_hours.length == 0) {
        return response.json({ success: false, message: 'Working hours are not specified for the business.', data: {} })
    }

    var user_hours = []
    const user_id = request.body.business_user_id;
    if (user_id != null) {
        user_hours = await UserHours.find_all({ business_user_id: user_id })
        if (user_hours.length == 0) {
            return response.json({ success: false, message: 'Working hours are not specified for the business user.', data: {} })
        }
    }
    var user = await BusinessUser.find_by_id(user_id)
    if (user == null) {
        return response.json({ success: false, message: 'Business user not found.', data: {} })
    }
    var customer = await Customer.find_by_id(request.body.customer_id)
    if (customer == null) {
        return response.json({ success: false, message: 'Customer not found.', data: {} })
    }

    var num_days_for_slots = parse_duration_in_days(node.allow_future_booking_for)

    // var date = new Date(request.body.date + ' 00:00:00');
    // if(date == null){
    //     return response.json({ success: false, message: 'Invalid date format!', data: {} })
    // }

    var start_time = request.body.start_time
    var end_time = request.body.end_time

    var is_conflicting = await check_conflict_with_customer_appointments(request.body.customer_id, start_time, end_time);
    if(is_conflicting){
        return response.json({ success: false, message: 'Appointment conflicts with your other appointment.', data: {} })
    }
    
    const start_date = moment.utc(start_time).startOf("day")
    const end_date = moment.utc(start_time).startOf("day")

    var time_zone = node.time_zone
    var available_slots_by_date = await find_slot_availability(time_zone, num_days_for_slots, start_date, end_date, node_hours, user_hours, user_id, service, node_id)

    var appointment_day = moment.utc(start_time).startOf("day")
    var appointment_start = moment.utc(start_time).utc();
    var appointment_end = moment.utc(end_time).utc();

    var available_slots_for_day = get_slots_for_day(available_slots_by_date, appointment_day)
    if(available_slots_for_day == null){
        return response.json({ success: false, message: 'Appointment slot is not available for the given day.', data: {} })
    }
    var is_available = is_slot_available(available_slots_for_day, appointment_start, appointment_end)
    if(!is_available){
        return response.json({ success: false, message: 'Appointment slot is not available.', data: {} })
    }

    var appointment_statuses = await AppointmentStatus.find_all({
        business_node_id: request.body.business_node_id,
        sequence: 1 //We need the starting status - most probably 'booked' or 'pending'
    })
    if(appointment_statuses.length == 0){
        return response.json({ success: false, message: 'Appointment status information is not updated for the business.', data: {} })
    }
    var appointment_status = appointment_statuses[0];

    var time_str = new Date().getTime().toString();
    time_str = time_str.substr(5, time_str.length);
    var d = new Date();
    var date_str = formatDate(d);
    var display_id = 'APP-' + date_str + '-' + time_str;

    //Create an appointment instance now
    var entity = {
        display_id: display_id,
        business_node_id: request.body.business_node_id,
        customer_id: request.body.customer_id,
        business_user_id: request.body.business_user_id,
        business_service_id: request.body.business_service_id,
        start_time:appointment_start.toDate(),
        end_time:appointment_end.toDate(),
        type: request.body.type ? request.body.type : 'IN-PERSON',
        note: request.body.note ? request.body.note : null,
        status: appointment_status.status ? appointment_status.status : '',
        status_code: appointment_status.status_code ? appointment_status.status_code: '',
        fees: request.body.fees ? request.body.fees: 0.0,
        tax: request.body.tax? request.body.tax: 0.0,
        tip: request.body.tip? request.body.tip: 0.0,
        discount: request.body.discount? request.body.discount: 0.0,
        coupon_code: request.body.coupon_code? request.body.coupon_code: null,
        total: request.body.total? request.body.total: 0.0,
        is_paid: request.body.is_paid? request.body.is_paid: false,
        transaction_id: request.body.transaction_id ? request.body.transaction_id : null
    }

    var customer_id = request.body.customer_id;

    var appointment = await Appointment.create(entity)
    if(appointment == null){
        return response.json({ success: false, message: 'An error occurred while booking an apoointment.', data: {} })
    }

    if(appointment_status.send_notification == true){
        //TODO: Send here the notification
    }
    if(appointment_status.send_sms == true){
        //TODO: Send here the sms
    }

    //Associate customer with node
    var node_customers = await BusinessNodeCustomer.find_all({
        business_node_id: node_id,
        customer_id: customer_id,
        is_active: true
    })
    if(node_customers.length == 0){
        var node_customer = await BusinessNodeCustomer.create({
            business_node_id: node_id,
            customer_id: customer_id,
            is_active: true
        });
    }

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Appointment is booked successfully!', data: { appointment: app } })
}

// Update appointment status
module.exports.update_appointment = async (request, response) => {
    console.log('Update appointment status: ', request.body)

    const appointment_id = request.params.appointment_id;
    var appointment = await Appointment.find_by_id(appointment_id)
    if(appointment == null)
    {
        return response.json({ success: false, message: 'Invalid appointment id.', data: {} })
    }

    var update_fields = get_update_fields(request)

    var res = await Appointment.update(appointment_id, update_fields);
    var appointment = await Appointment.find_by_id(appointment_id)

    if (request.body.hasOwnProperty('status_code')) {

        //If status is updated, ... notify user if configured
        var appointment_statuses = await AppointmentStatus.find_all({
            business_node_id: appointment.business_node_id,
            status_code: request.body.status_code
        })
        if (appointment_statuses.length > 0) {

            var appointment_status = appointment_statuses[0];

            if(appointment_status.is_cancellation_status){
                var updated = await Appointment.update(appointment_id, {
                    is_cancelled: true,
                    is_active: false,
                    status: appointment_status.status,
                    status_code: appointment_status.status_code,
                    cancelled_on: moment().toDate()
                });
            }
            if(appointment_status.is_confirmed_status){
                var updated = await Appointment.update(appointment_id, {
                    is_confirmed: true,
                    is_cancelled: false,
                    is_active: true,
                    status: appointment_status.status,
                    status_code: appointment_status.status_code,
                    confirmed_on: moment().toDate()
                });
            }
            if(appointment_status.is_completed_status){
                var updated = await Appointment.update(appointment_id, {
                    is_completed: true,
                    is_cancelled: false,
                    is_active: false,
                    status: appointment_status.status,
                    status_code: appointment_status.status_code,
                    confirmed_on: moment().toDate()
                });
            }

            if (appointment_status.send_notification == true) {
                //TODO: Send here the notification
            }
            if (appointment_status.send_sms == true) {
                //TODO: Send here the sms
            }
        }
    }

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Appointment is updated successfully!', data: { appointment: app } })
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports.find_by_id = async (request, response) => {

    var appointment_id = request.params.appointment_id
    console.log('Find appointment by id: ', appointment_id)

    if (!appointment_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var appointment = await Appointment.find_by_id(appointment_id)

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Appointment', data: { appointment: app } })
}

module.exports.find_by_display_id = async (request, response) => {

    var display_id = request.params.display_id
    console.log('Find appointment by display id: ', display_id)

    if (!display_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var appointment = await Appointment.find_by_display_id(display_id)

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Appointment', data: { appointment: app } })
}

module.exports.find_by_user = async (request, response) => {
    console.log('Get all appointments for the user')

    const user_id = request.params.user_id;
    var user = await BusinessUser.find_by_id(user_id)
    if (user == null) {
        return response.json({ success: false, message: 'Invalid user id.', data: {} })
    }

    var selector = {
        business_user_id: user_id,
    }
    update_appointment_selector(request, selector)

    var appointments = await Appointment.find_all(selector);

    var apps = []
    for await(var appointment of appointments){
        var app = await get_appointment_object(appointment)
        apps.push(app)
    }
    return response.json({ success: true, message: 'Appointments for user', data: { appointments: apps } })
}

module.exports.find_by_node = async (request, response) => {
    console.log('Get all appointments for the node')

    const node_id = request.params.node_id;
    var node = await BusinessNode.find_by_id(node_id)
    if (node == null) {
        return response.json({ success: false, message: 'Invalid user id.', data: {} })
    }

    var selector = {
        business_node_id: node_id,
    }
    update_appointment_selector(request, selector)

    var appointments = await Appointment.find_all(selector);

    var apps = []
    for await(var appointment of appointments){
        var app = await get_appointment_object(appointment)
        apps.push(app)
    }
    return response.json({ success: true, message: 'Appointments for node', data: { appointments: apps } })
}

module.exports.find_by_customer = async (request, response) => {
    console.log('Get all appointments for the customer')

    const customer_id = request.params.customer_id;
    var customer = await Customer.find_by_id(customer_id)
    if (customer == null) {
        return response.json({ success: false, message: 'Invalid customer id.', data: {} })
    }

    var selector = {
        customer_id: customer_id,
    }
    update_appointment_selector(request, selector)

    var appointments = await Appointment.find_all(selector);

    var apps = []
    for await(var appointment of appointments){
        var app = await get_appointment_object(appointment)
        apps.push(app)
    }
    return response.json({ success: true, message: 'Appointments for customer', data: { appointments: apps } })
}

module.exports.cancel_appointment = async (request, response) => {
    console.log('Cancel the appointment')

    var appointment_id = request.params.appointment_id
    console.log('Find appointment by id: ', appointment_id)
    if (!appointment_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var appointment = await Appointment.find_by_id(appointment_id)
    if (appointment == null) {
        return response.json({ success: false, message: 'Appointment not found.', data: {} })
    }

    var appointment_statuses = await AppointmentStatus.find_all({
        business_node_id: appointment.business_node_id,
        is_cancellation_status: true
    })
    if(appointment_statuses.length == 0){
        return response.json({ success: false, message: 'No equivalent cancellation status found for business node.', data: {} })
    }

    var appointment_status = appointment_statuses[0];

    var updated = await Appointment.update(appointment_id, {
        is_cancelled: true,
        is_active: false,
        status: appointment_status.status,
        status_code: appointment_status.status_code,
        cancelled_on: moment().toDate()
    });

    var appointment = await Appointment.find_by_id(appointment_id)

    if(appointment_status.send_notification == true){
        //TODO: Send here the notification
    }
    if(appointment_status.send_sms == true){
        //TODO: Send here the sms
    }

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Cancelled appointment', data: { appointment: app } })
}

module.exports.complete_appointment = async (request, response) => {
    console.log('Complete the appointment')

    var appointment_id = request.params.appointment_id
    console.log('Find appointment by id: ', appointment_id)
    if (!appointment_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var appointment = await Appointment.find_by_id(appointment_id)
    if (appointment == null) {
        return response.json({ success: false, message: 'Appointment not found.', data: {} })
    }

    var appointment_statuses = await AppointmentStatus.find_all({
        business_node_id: appointment.business_node_id,
        is_completed_status: true
    })
    if(appointment_statuses.length == 0){
        return response.json({ success: false, message: 'No equivalent completion status found for business node.', data: {} })
    }

    var appointment_status = appointment_statuses[0];

    var updated = await Appointment.update(appointment_id, {
        is_completed: true,
        is_active: false,
        status: appointment_status.status,
        status_code: appointment_status.status_code,
        completed_on: moment().toDate()
    });

    var appointment = await Appointment.find_by_id(appointment_id)

    if(appointment_status.send_notification == true){
        //TODO: Send here the notification
    }
    if(appointment_status.send_sms == true){
        //TODO: Send here the sms
    }

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Completed appointment', data: { appointment: app } })
}

module.exports.confirm_appointment = async (request, response) => {
    console.log('Confirm the appointment')

    var appointment_id = request.params.appointment_id
    console.log('Find appointment by id: ', appointment_id)
    if (!appointment_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var appointment = await Appointment.find_by_id(appointment_id)
    if (appointment == null) {
        return response.json({ success: false, message: 'Appointment not found.', data: {} })
    }

    var appointment_statuses = await AppointmentStatus.find_all({
        business_node_id: appointment.business_node_id,
        is_confirmed_status: true
    })
    if(appointment_statuses.length == 0){
        return response.json({ success: false, message: 'No equivalent confirmed status found for business node.', data: {} })
    }

    var appointment_status = appointment_statuses[0];

    var updated = await Appointment.update(appointment_id, {
        is_confirmed: true,
        is_active: true,
        status: appointment_status.status,
        status_code: appointment_status.status_code,
        confirmed_on: moment().toDate()
    });

    var appointment = await Appointment.find_by_id(appointment_id)

    if(appointment_status.send_notification == true){
        //TODO: Send here the notification
    }
    if(appointment_status.send_sms == true){
        //TODO: Send here the sms
    }

    var app = await get_appointment_object(appointment)
    return response.json({ success: true, message: 'Confirmed appointment', data: { appointment: app } })
}

//Functions

async function find_slot_availability(time_zone, num_days_for_slots, start_date, end_date, node_hours, user_hours, user_id, service, node_id) {

    var holidays = []
    var business_holidays = get_holidays(node_hours, num_days_for_slots)
    var user_holidays = get_holidays(user_hours, num_days_for_slots)
    holidays.push(...business_holidays)
    holidays.push(...user_holidays)

    var weekly_work_days = get_working_week_days(node_hours, user_id, user_hours)

    moment.updateLocale('us', {
        holidays: holidays,
        holidayFormat: 'DD-MM-YYYY',
        //workingWeekdays: [1, 2, 3, 4, 5, 6]
        workingWeekdays: weekly_work_days
    })

    var slot_duration = parse_duration_in_min(service.service_duration)
    var prior_booking_window_min = parse_duration_in_min(service.prior_booking_window)

    var slots_by_date = get_all_slots(time_zone, start_date, end_date, slot_duration, prior_booking_window_min, node_hours, user_id, user_hours)
    var available_slots_by_date = await get_available_slots(time_zone, slots_by_date, node_id, user_id, service.id, num_days_for_slots)
    return available_slots_by_date
}

function get_all_slots(time_zone, start_date, end_date, slot_duration, prior_booking_window_minutes, node_hours, user_id, user_hours) {

    var node_working_days = new Map()

    for (var j = 0; j < node_hours.length; j++) {

        var nh = node_hours[j]

        if (nh.date == null) {
            node_working_days.set(nh.day, {
                start_time: nh.start_time,
                end_time: nh.end_time,
                is_open: nh.is_open
            })
        }
    }

    var node_slots_by_date = []

    var number_of_days = 0
    var currMoment = start_date.clone().utc()

    var span_start = start_date.clone().utc()
    var span_end = end_date.clone().utc()

    if(span_start.startOf("day").isSame(span_end)){
        number_of_days = 1
    }
    else{
        var a = currMoment.clone()
        var b = span_end.clone()
        var diff = b.businessDiff(a)
        number_of_days = Math.ceil(diff) + 1;
    }

    var { offset_hours, offset_minutes } = get_timezone_offsets(time_zone)

    for (var i = 0; i < number_of_days; i++) {

        if (currMoment.isBusinessDay()) {

            var current_day = currMoment.day()
            var wd = node_working_days.get(current_day)
            var start_time = wd.start_time
            var end_time = wd.end_time

            var curr_day_start = currMoment.clone().startOf("day").utc()

            var start_tokens = start_time.split(":")
            var start_hours = parseInt(start_tokens[0])
            var start_minutes = parseInt(start_tokens[1])
            var end_tokens = end_time.split(":")
            var end_hours = parseInt(end_tokens[0])
            var end_minutes = parseInt(end_tokens[1])

            var start = curr_day_start.clone().utc().add(start_hours, 'hours').add(start_minutes, 'minutes')
            var end = curr_day_start.clone().utc().add(end_hours, 'hours').add(end_minutes, 'minutes')

            node_slots_by_date.push({
                current_moment: curr_day_start.clone(),
                date: curr_day_start.clone().format(),
                weekday: curr_day_start.clone().day(),
                day_start_time: start.add(offset_hours, 'hours').add(offset_minutes, 'minutes'),
                day_end_time: end.add(offset_hours, 'hours').add(offset_minutes, 'minutes'),
                slots: calculate_slots(time_zone, curr_day_start.clone(), start_time, end_time, slot_duration, prior_booking_window_minutes)
            })
        }
        currMoment = currMoment.nextBusinessDay().startOf("day")
    }

    var slots_by_date = node_slots_by_date

    //Filter the slots based on user's hours
    if (user_id != null) {

        var user_working_days = new Map()

        for (var j = 0; j < user_hours.length; j++) {
            var uh = user_hours[j]
            if(uh.date != null){
                continue;
            }
            user_working_days.set(uh.day, {
                start_time: uh.start_time,
                end_time: uh.end_time,
                is_open: uh.is_open
            })
        }

        var user_slots_by_date = []

        for (var k = 0; k < node_slots_by_date.length; k++) {

            var node_slot = node_slots_by_date[k]
            var weekday = node_slot.weekday
            var user_current_day_start = node_slot.current_moment.clone().startOf("day").utc()
            var user_slots_for_day = []

            if (user_working_days.has(weekday)) {

                var user_working_day = user_working_days.get(weekday)

                if(user_working_day.is_open){

                    var start_time = user_working_day.start_time
                    var end_time = user_working_day.end_time
    
                    var start_tokens = start_time.split(":")
                    var start_hours = parseInt(start_tokens[0])
                    var start_minutes = parseInt(start_tokens[1])
                    var end_tokens = end_time.split(":")
                    var end_hours = parseInt(end_tokens[0])
                    var end_minutes = parseInt(end_tokens[1])
    
                    var start = user_current_day_start.clone().utc().add(start_hours, 'hours').add(start_minutes, 'minutes').add(offset_hours, 'hours').add(offset_minutes, 'minutes')
                    var end = user_current_day_start.clone().utc().add(end_hours, 'hours').add(end_minutes, 'minutes').add(offset_hours, 'hours').add(offset_minutes, 'minutes')
                    
                    for (var p = 0; p < node_slot.slots.length; p++) {
                        var s = node_slot.slots[p]
    
                        if (s.slot_start.isSameOrAfter(start) &&
                            s.slot_end.isSameOrBefore(end)) {
                            user_slots_for_day.push(s)
                        }
                    }
    
                    var user_slot = {
                        current_moment: user_current_day_start.clone(),
                        date: user_current_day_start.clone().format(),
                        weekday: user_current_day_start.clone().day(),
                        day_start_time: start,
                        day_end_time: end,
                        user_off_day: false,
                        slots: user_slots_for_day
                    }
                    user_slots_by_date.push(user_slot)
                }
                else{
                    var user_slot = {
                        current_moment: user_current_day_start.clone(),
                        date: user_current_day_start.clone().format(),
                        weekday: user_current_day_start.clone().day(),
                        day_start_time: null,
                        day_end_time: null,
                        user_off_day: true,
                        slots: []
                    }
                    user_slots_by_date.push()
                }
            }
        }
        slots_by_date = user_slots_by_date
    }
    return slots_by_date
}

function get_timezone_offsets(time_zone) {

    var offset = time_zone
    if (time_zone.includes('+')) {
        offset = offset.replace('+', '-')
    }
    else if(!time_zone.includes('-')){
        offset = offset.replace(' ', '')
        offset = '-' + offset
    }
    else if (time_zone.includes('-')) {
        offset = offset.replace('-', '+')
    }

    if(time_zone.includes(':')){
        var tokens = offset.split(":")
        var offset_hours = parseInt(tokens[0])
        var offset_minutes = parseInt(tokens[1])
        if (offset_hours < 0) {
            offset_minutes = -1 * offset_minutes
        }
        return { offset_hours, offset_minutes }
    }
    else {
        var len = offset.length;
        var min = offset.substring(len-2, len);
        var hr = offset.substring(0, len-2);
        var offset_hours = parseInt(hr)
        var offset_minutes = parseInt(min)
        if (offset_hours < 0) {
            offset_minutes = -1 * offset_minutes
        }
        return { offset_hours, offset_minutes }
    }

}

async function get_available_slots(time_zone, slots_by_date, node_id, user_id, service_id, num_days_for_slots) {

    var end_date = moment.utc().businessAdd(num_days_for_slots)._d

    var appointments = await Appointment.find_all({
        business_node_id: node_id,
        business_user_id: user_id,
        business_service_id: service_id,
        start_time: {
            [Op.gte]: moment.utc().toDate() //only future appointments
        },
        end_time: {
            [Op.lte]: moment.utc(end_date).toDate()
        },
        is_cancelled: false,
        is_active: true
    });

    for (var j = 0; j < slots_by_date.length; j++) {

        var sd = slots_by_date[j]
        var slot_day = sd.current_moment

        for (var i = 0; i < appointments.length; i++) {

            var appointment = appointments[i]
            var appointment_day = moment.utc(appointment.start_time).startOf("day")

            if (!appointment_day.isSame(slot_day)) {
                continue;
            }

            var start = moment.utc(appointment.start_time)
            var end = moment.utc(appointment.end_time)

            for (var k = 0; k < sd.slots.length; k++) {

                var slot_start = sd.slots[k].slot_start
                var slot_end = sd.slots[k].slot_end

                if (start.isSame(slot_start) && end.isSame(slot_end)) {
                    slots_by_date[j].slots[k].available = false
                }
            }
        }
    }
    return slots_by_date;
}

function parse_duration_in_min(str) {
    var tokens = str.toLowerCase().split(":")
    var duration_min = 0
    for (var i = 0; i < tokens.length; i++) {
        var x = tokens[i]
        if (x.includes("m")) {
            x = x.replace("m", "")
            var minutes = parseInt(x)
            duration_min += minutes
        }
        if (x.includes("h")) {
            x = x.replace("h", "")
            var hours = parseInt(x)
            duration_min += (hours * 60)
        }
        if (x.includes("d")) {
            x = x.replace("d", "")
            var days = parseInt(x)
            duration_min += (days * 60 * 24)
        }
        if (x.includes("w")) {
            x = x.replace("w", "")
            var weeks = parseInt(x)
            duration_min += (weeks * 60 * 24 * 7)
        }
    }
    return duration_min
}

function parse_duration_in_days(str) {
    var tokens = str.toLowerCase().split(":")
    var duration_days = 0
    for (var i = 0; i < tokens.length; i++) {
        var x = tokens[i]
        if (x.includes("d")) {
            x = x.replace("d", "")
            var days = parseInt(x)
            duration_days += days
        }
        if (x.includes("w")) {
            x = x.replace("w", "")
            var weeks = parseInt(x)
            duration_days += (weeks * 7)
        }
    }
    return duration_days
}

function calculate_slots(time_zone, dateMoment, start_time, end_time, time_slot_duration_min, prior_booking_window_minutes) {

    var { offset_hours, offset_minutes } = get_timezone_offsets(time_zone)

    //Filter the slots based on prior booking window (defined in minutes)
    var booking_window_moment = moment.utc().add(prior_booking_window_minutes, 'minutes')

    slots = []
    var start_tokens = start_time.split(":")
    var start_hours = parseInt(start_tokens[0])
    var start_minutes = parseInt(start_tokens[1])
    var end_tokens = end_time.split(":")
    var end_hours = parseInt(end_tokens[0])
    var end_minutes = parseInt(end_tokens[1])

    var start = dateMoment.clone().utc().add({ hours: start_hours, minutes: start_minutes }).add(offset_hours, 'hours').add(offset_minutes, 'minutes');
    var end = dateMoment.clone().utc().add({ hours: end_hours, minutes: end_minutes }).add(offset_hours, 'hours').add(offset_minutes, 'minutes');

    var slot_start = start.clone()
    var slot_end = start.clone().add(time_slot_duration_min, 'minutes')

    while (slot_end.isSameOrBefore(end)) {
        var available = true
        if(slot_start.isBefore(booking_window_moment)){
            available = false
        }
        slots.push({
            slot_start: slot_start,
            slot_end: slot_end,
            available: available
        })
        slot_start = slot_end.clone()
        slot_end = slot_start.clone().add(time_slot_duration_min, 'minutes')
    }
    return slots
}

function is_slot_available(slots, appointment_start, appointemnt_end) {

    var a_start = appointment_start.clone().utc()
    var a_end = appointemnt_end.clone().utc()

    for(var i = 0; i < slots.length; i++){

        var slot_start = slots[i].slot_start.clone().utc()
        var slot_end = slots[i].slot_end.clone().utc()
        var available = slots[i].available

        if(a_start.isSame(slot_start) && a_end.isSame(slot_end) && available){
            return true;
        }
    }
    return false;
}

function get_slots_for_day(slots_by_date, day){

    for(var i = 0; i < slots_by_date.length; i++){
        var d = slots_by_date[i].current_moment
        if(d.isSame(day)){
            return slots_by_date[i].slots
        }
    }

    return null
}

function get_update_fields(request) {
    var update_fields = {}
    if (request.body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = request.body.business_node_id
    }
    if (request.body.hasOwnProperty('customer_id')) {
        update_fields.customer_id = request.body.customer_id
    }
    if (request.body.hasOwnProperty('business_user_id')) {
        update_fields.business_user_id = request.body.business_user_id
    }
    if (request.body.hasOwnProperty('business_service_id')) {
        update_fields.business_service_id = request.body.business_service_id
    }
    if (request.body.hasOwnProperty('start_time')) {
        update_fields.start_time = request.body.start_time
    }
    if (request.body.hasOwnProperty('end_time')) {
        update_fields.end_time = request.body.end_time
    }
    if (request.body.hasOwnProperty('type')) {
        update_fields.type = request.body.type
    }
    if(request.body.hasOwnProperty('note')){
        update_fields.note = request.body.note
    }
    if (request.body.hasOwnProperty('status')) {
        update_fields.status = request.body.status
    }
    if (request.body.hasOwnProperty('status_code')) {
        update_fields.status_code = request.body.status_code
    }
    if (request.body.hasOwnProperty('fees')) {
        update_fields.fees = request.body.fees
    }
    if (request.body.hasOwnProperty('tax')) {
        update_fields.tax = request.body.tax
    }
    if (request.body.hasOwnProperty('tip')) {
        update_fields.tip = request.body.tip
    }
    if (request.body.hasOwnProperty('discount')) {
        update_fields.discount = request.body.discount
    }
    if (request.body.hasOwnProperty('coupon_code')) {
        update_fields.coupon_code = request.body.coupon_code
    }
    if (request.body.hasOwnProperty('total')) {
        update_fields.total = request.body.total
    }
    if (request.body.hasOwnProperty('is_paid')) {
        update_fields.is_paid = request.body.is_paid
    }
    if (request.body.hasOwnProperty('transaction_id')) {
        update_fields.transaction_id = request.body.transaction_id
    }
    
    //////////////////////////////////////////////////////////////

    // Please don't accept these update fields here...

    // if (request.body.hasOwnProperty('is_confirmed')) {
    //     update_fields.is_confirmed = request.body.is_confirmed
    // }
    // if (request.body.hasOwnProperty('confirmed_on')) {
    //     update_fields.confirmed_on = request.body.confirmed_on
    // }
    // if (request.body.hasOwnProperty('is_cancelled')) {
    //     update_fields.is_cancelled = request.body.is_cancelled
    // }
    // if (request.body.hasOwnProperty('cancelled_on')) {
    //     update_fields.cancelled_on = request.body.cancelled_on
    // }
    // if (request.body.hasOwnProperty('is_completed')) {
    //     update_fields.is_completed = request.body.is_completed
    // }
    // if (request.body.hasOwnProperty('completed_on')) {
    //     update_fields.completed_on = request.body.completed_on
    // }

    //////////////////////////////////////////////////////////////

    if (request.body.hasOwnProperty('is_rescheduled')) {
        update_fields.is_rescheduled = request.body.is_rescheduled
    }
    if (request.body.hasOwnProperty('rescheduled_on')) {
        update_fields.rescheduled_on = request.body.rescheduled_on
    }
    if (request.body.hasOwnProperty('rescheduled_appointment_id')) {
        update_fields.rescheduled_appointment_id = request.body.rescheduled_appointment_id
    }
    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

function get_holidays(work_hours, num_days_for_slots) {

    //Format as below
    //var independenceDay = '15-08-2020'
    //var republicDay = '26-01-2020'
    //var holidays = [republicDay, independenceDay]

    var upto_date = moment().add(num_days_for_slots, 'days')

    var holidays = []
    
    for (var i = 0; i < work_hours.length; i++) {
        var nd = work_hours[i]
        if (nd.type != "WEEKDAY" && nd.type != "WEEKEND") {

            //It is a special day / holiday
            //nd.start_time == null && nd.end_time == null && 

            if (nd.date != null && nd.is_open == false) {
                //no working hours and defined by date-not by day
                var date = moment(nd.date)
                if (date.isSameOrBefore(upto_date)) {
                    var date_str = date.format("DD-MM-YYYY");
                    holidays.push(date_str)
                }
            }
        }
    }
    return holidays
}

function get_working_week_days(node_hours, user_id, user_hours) {
    
    var weekly_work_days = []

    var business_weekdays = get_weekdays(node_hours)

    if (user_id != null) {
        var user_weekdays = get_weekdays(user_hours)
        for (var i = 0; i < user_weekdays.length; i++) {
            var x = user_weekdays[i]
            if (business_weekdays.includes(x)) {
                weekly_work_days.push(user_weekdays[i])
            }
        }
    }
    else {
        weekly_work_days = business_weekdays
    }
    return weekly_work_days
}

function get_weekdays(work_hours) {
    var weekdays = []
    for (var j = 0; j < work_hours.length; j++) {
        var wh = work_hours[j]
        if (wh.is_open && wh.date == null && wh.is_active) {
            weekdays.push(work_hours[j].day)
        }
    }
    return weekdays
}

function transform(time_zone, slots_by_date) {
    
    var slots = []
    for (var i = 0; i < slots_by_date.length; i++) {
        var temp = slots_by_date[i]
        var day_slots = []
        for (var j = 0; j < temp.slots.length; j++) {
            day_slots.push({
                slot_start: moment.utc(temp.slots[j].slot_start).format(),
                slot_end: moment.utc(temp.slots[j].slot_end).format(),
                available: temp.slots[j].available
            })
        }
        var s = {
            date: temp.current_moment.utc().format("YYYY-MM-DD"),
            week_day_id: temp.current_moment.utc().day(),
            week_day: temp.current_moment.utc().format("dddd"),
            day_start_time: temp.day_start_time,
            day_end_time: temp.day_end_time,
            slots: day_slots
        }
        slots.push(s)
    }
    return slots
}

async function get_appointment_object(appointment) {

    var user = await BusinessUser.find_by_id(appointment.business_user_id)
    var customer = await Customer.find_by_id(appointment.customer_id)
    var service = await BusinessService.find_by_id(appointment.business_service_id)
    var node = await BusinessNode.find_by_id(appointment.business_node_id)

    return {
        id: appointment.id,
        display_id: appointment.display_id,
        business_node_id: appointment.business_node_id,
        customer_id: appointment.customer_id,
        business_user_id: appointment.business_user_id,
        business_service_id: appointment.business_service_id,
        business_node_name: node.name,
        business_service_name: service.name,
        business_user_name: user.prefix + ' ' + user.first_name + ' ' + user.last_name,
        customer_name: customer.prefix + ' ' + customer.first_name + ' ' + customer.last_name,
        customer_dob: customer.dob,
        customer_gender: customer.gender,
        customer_display_picture: customer.display_picture,
        date: moment(appointment.start_time).local().format("YYYY-MM-DD"),
        start_time: moment(appointment.start_time).local().format("HH:mm:ss"),
        end_time: moment(appointment.end_time).local().format("HH:mm:ss"),
        start_time_utc: appointment.start_time,
        end_time_utc: appointment.end_time,
        type: appointment.type,
        note: appointment.note,
        status: appointment.status,
        status_code: appointment.status_code,
        fees: appointment.fees,
        tax: appointment.tax,
        tip: appointment.tip,
        discount: appointment.discount,
        coupon_code: appointment.coupon_code,
        total: appointment.total,
        is_paid: appointment.is_paid,
        transaction_id: appointment.transaction_id
    }
}

function get_utc_date(date, offset_hours, offset_minutes, end_of_day){
    var tokens = date.split('-')
    var x = new Date(Date.UTC(tokens[0], tokens[1] - 1, tokens[2]));
    var m = moment(x.toUTCString())
    if(end_of_day){
        m = m.add(1, 'days');
    }
    var minutes = offset_minutes + (60 * offset_hours)
    if(minutes < 0){
        var a = m.clone().subtract(-1 * minutes, 'minutes')
        return a.toDate()
    }
    var b = m.clone().add(minutes, 'minutes')
    return b.toDate()
}

function get_current_utc_date() {
    var x = new Date(Date.now())
    var m = moment.utc(x.toUTCString())
    return m.toDate()
}

function update_appointment_selector(request, selector) {

    const from_date = (typeof request.query.from_date != 'undefined') ? request.query.from_date : null
    const to_date = (typeof request.query.to_date != 'undefined') ? request.query.to_date : null
    const time_zone = (typeof request.query.time_zone != 'undefined') ? request.query.time_zone : null
    const show = (typeof request.query.show != 'undefined') ? request.query.show : null

    _.set(selector, 'is_cancelled', false)
    _.set(selector, 'is_active', true)

    if (show) {
        if (show == 'cancelled') {
            _.set(selector, 'is_cancelled', true)
            _.set(selector, 'is_active', false)
        }
        else if (show == 'completed') {
            _.set(selector, 'is_completed', true)
            _.set(selector, 'is_active', false)
        }
        else if (show == 'confirmed') {
            _.set(selector, 'is_confirmed', true)
            _.set(selector, 'is_active', true)
        }
    }

    if (from_date != null && to_date != null && time_zone != null) {

        var { offset_hours, offset_minutes } = get_timezone_offsets(time_zone)
        var start = get_utc_date(from_date, offset_hours, offset_minutes, false)
        var end = get_utc_date(to_date, offset_hours, offset_minutes, true)

        _.set(selector, 'start_time', {
            [Op.gte]: start
        })
        _.set(selector, 'end_time', {
            [Op.lte]: end
        })
    }
    else {

        var current = get_current_utc_date()
        _.set(selector, 'start_time', {
            [Op.gte]: current
        })
        var to = moment.utc().add(30, 'days').toDate()
        _.set(selector, 'end_time', {
            [Op.lte]: to
        })
    }
}

function get_utc_date_after(minutes) {
    var x = new Date(Date.now())
    var m = moment.utc(x.toUTCString())
    var d = m.clone().add(minutes, 'minutes')
    return d.toDate()
}

function get_utc_date_before(minutes) {
    var x = new Date(Date.now())
    var m = moment.utc(x.toUTCString())
    var d = m.clone().subtract(minutes, 'minutes')
    return d.toDate()
}

module.exports.find_all_upcoming_appointments_at_specific_duration = async (request, response) => {

    var reminder_window_minutes = 60;
    const minutes = (typeof request.query.minutes != 'undefined') ? request.query.minutes : null;
    if(minutes != null){
        reminder_window_minutes = parseInt(minutes);
    }

    console.log('Get all appointments in next ' + reminder_window_minutes + ' minutes.');
    
    var from = get_utc_date_before(5);
    var to = get_utc_date_after(reminder_window_minutes + 5);

    var selector = {}
    _.set(selector, 'start_time', {
        [Op.between]: [from, to]
    })
    _.set(selector, 'is_active', true)

    var appointments = await Appointment.find_all(selector);

    var apps = []
    for await(var appointment of appointments){
        var app = await get_appointment_object(appointment)
        apps.push(app)
    }
    return response.json({ success: true, message: 'Upcoming appointments next ' + reminder_window_minutes + ' minutes.', data: { appointments: apps } })
}

async function check_conflict_with_customer_appointments(customer_id, start_time, end_time){

    var start = moment.utc(start_time)
    var end = moment.utc(end_time)

    var selector = {
        customer_id: customer_id,
        is_cancelled: false,
        is_active: true,
        [Op.or]: [
            {
                start_time: {
                    [Op.gte]: start,
                    [Op.lte]: end
                }
            },
            {
                end_time: {
                    [Op.gte]: start,
                    [Op.lte]: end
                }
            }
        ]
    };

    var appointments = await Appointment.find_all(selector);
    if(appointments.length > 0){
        return true;
    }

    selector = {
        customer_id: customer_id,
        is_cancelled: false,
        is_active: true,
        [Op.or]: [
            {
                start_time: {
                    [Op.lte]: start,
                },
                end_time: {
                    [Op.gte]: end,
                }
            },
            {
                start_time: {
                    [Op.gte]: start,
                },
                end_time: {
                    [Op.lte]: end,
                }
            }
        ]
    };
    appointments = await Appointment.find_all(selector);
    if(appointments.length > 0){
        return true;
    }
    return false;
}


async function can_customer_book_this_slot(customer_id, start_time, end_time){

    var start = moment.utc(start_time)
    var end = moment.utc(end_time)

    var selector = {
        customer_id: customer_id,
        is_cancelled: false,
        is_active: true,
        [Op.or]: [
            {
                start_time: {
                    [Op.gte]: start,
                    [Op.lte]: end
                }
            },
            {
                end_time: {
                    [Op.gte]: start,
                    [Op.lte]: end
                }
            }
        ]
    };

    var appointments = await Appointment.find_all(selector);
    if(appointments.length > 0){
        return {
            can_book: false,
            conflicting_appointment: appointments[0]
        }
    }

    selector = {
        customer_id: customer_id,
        is_cancelled: false,
        is_active: true,
        [Op.or]: [
            {
                start_time: {
                    [Op.lte]: start,
                },
                end_time: {
                    [Op.gte]: end,
                }
            },
            {
                start_time: {
                    [Op.gte]: start,
                },
                end_time: {
                    [Op.lte]: end,
                }
            }
        ]
    };
    appointments = await Appointment.find_all(selector);
    if(appointments.length > 0){
        return {
            can_book: false,
            conflicting_appointment: appointments[0]
        }
    }
    return { 
        can_book: true,
        conflicting_appointment: null
    };
}

