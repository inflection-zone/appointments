const Customer = require('../models/customer.model.js')
const BusinessNodeCustomer = require('../models/business.node.customer.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

// Create customer
module.exports.create = async (request, response) => {

    console.log('Create new customer: ', request.body)

    if (!request.body.mobile) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    if (!request.body.allow_duplicate_mobile) {

        // Check if business already exist with same mobile
        var mobile = request.body.mobile
        var existingCustomer = await Customer.find_by_mobile(mobile)
        if (existingCustomer) {
            console.log("Customer with email already exist: ", mobile, " Id: ", existingCustomer.id)
            return response.json({ success: false, message: 'Customer already exists with mobile number: ' + mobile, data: {} })
        }

        // Check if business already exist with same email
        var email = request.body.email
        if (email) {
            existingCustomer = await Customer.find_by_email(email)
            if (existingCustomer) {
                console.log("Customer with email already exist: ", email, " Id: ", existingCustomer.id)
                return response.json({ success: false, message: 'Customer already exists with email id: ' + email, data: {} })
            }
        }
    }

    var new_customer = {}
    new_customer.first_name = request.body.first_name
    new_customer.last_name = request.body.last_name
    new_customer.prefix = request.body.prefix
    new_customer.mobile = request.body.mobile
    new_customer.email = request.body.email
    new_customer.gender = request.body.gender

    new_customer.dob = request.body.dob ? request.body.dob : null

    new_customer.display_picture = request.body.display_picture ? request.body.display_picture: null
    new_customer.address = request.body.address ? request.body.address : null
    new_customer.in_app_user = request.body.in_app_user ? request.body.in_app_user : true

    new_customer.is_active = true

    var customer = await Customer.create(new_customer)

    if(customer == null){
        return response.json({ success: false, message: 'Unable to create customer.', data: {input: new_customer} })
    }

    return response.json({
        success: true, message: 'Customer created', data: {
            customer: customer
        }
    })
}

// Get all customers
module.exports.find_all = async (request, response) => {
    console.log('Get all customers')

    const email = (typeof request.query.email != 'undefined') ? request.query.email : null;
    const mobile = (typeof request.query.mobile != 'undefined') ? request.query.mobile : null;
    const name = (typeof request.query.name != 'undefined') ? request.query.name : null;

    var selector = {
        is_active: true
    }

    if (email != null) {
        selector.email = { [Op.like]: '%' + email + '%' }
    }
    if (mobile != null) {
        selector.mobile = { [Op.like]: '%' + mobile + '%' }
    }

    var customers = await Customer.find_all(selector);

        //Filter the customers by name
    if (name != null) {
        var customers_with_matching_names = [];
        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            var nameTemp = name.toLowerCase();
            var firstNameLower = customer.first_name.toLowerCase();
            var lastNameLower = customer.last_name.toLowerCase();
            if (firstNameLower.includes(nameTemp) ||
                lastNameLower.includes(nameTemp) ||
                nameTemp.includes(firstNameLower) ||
                nameTemp.includes(lastNameLower) ||
                nameTemp == firstNameLower + ' ' + lastNameLower) {
                customers_with_matching_names.push(customer);
            }
        }
        customers = customers_with_matching_names
    }


    return response.json({ success: true, message: 'Customer list', data: { customers: customers } })
}

// Find customer by id
module.exports.find_by_id = async (request, response) => {

    var customer_id = request.params.customer_id
    console.log('Find customer by id: ', customer_id)

    if (!customer_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var customer = await Customer.find_by_id(customer_id)
    return response.json({ success: true, message: 'Customer', data: { customer: customer } })
}

// Update customer by id
module.exports.update = async (request, response) => {
    console.log('Update customer by id')

    if (!request.params.customer_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var customer_id = request.params.customer_id;
    var customer = await Customer.find_by_id(customer_id)
    if (customer == null) {
        return response.json({ success: false, message: 'Customer not found', data: {} })
    }

    if (request.body.hasOwnProperty('mobile')) {
        var mobile = request.body.mobile
        var other_entity = await Customer.find_by_mobile(mobile)
        if (other_entity != null && other_entity.id != customer.id) {
            console.log("Customer with email already exist: ", mobile, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Customer already exists with mobile number: ' + mobile, data: {} })
        }
    }
    if (request.body.hasOwnProperty('email')) {
        var email = request.body.email
        var other_entity = await Customer.find_by_email(email)
        if (other_entity != null && other_entity.id != customer.id) {
            console.log("Customer with email already exist: ", email, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Customer already exists with email id: ' + email, data: {} })
        }
    }

    var update_fields = get_update_fields(request)
    var updated = await Customer.update(customer_id, update_fields)
    return response.json({ success: true, message: 'Customer updated successfully', data: { customer: updated } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_node_id')) {
        update_fields.business_node_id = request.body.business_node_id
    }

    if (request.body.hasOwnProperty('first_name')) {
        update_fields.first_name = request.body.first_name
    }
    if (request.body.hasOwnProperty('last_name')) {
        update_fields.last_name = request.body.last_name
    }
    if (request.body.hasOwnProperty('prefix')) {
        update_fields.prefix = request.body.prefix
    }
    if (request.body.hasOwnProperty('mobile')) {
        update_fields.mobile = request.body.mobile
    }
    if (request.body.hasOwnProperty('email')) {
        update_fields.email = request.body.email
    }
    if (request.body.hasOwnProperty('dob')) {
        update_fields.dob = request.body.dob
    }
    if (request.body.hasOwnProperty('gender')) {
        update_fields.gender = request.body.gender
    }
    if (request.body.hasOwnProperty('display_picture')) {
        update_fields.display_picture = request.body.display_picture
    }
    if (request.body.hasOwnProperty('address')) {
        update_fields.address = request.body.address
    }
    if (request.body.hasOwnProperty('in_app_user')) {
        update_fields.in_app_user = request.body.in_app_user
    }

    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

// Update customer by id
module.exports.delete_by_id = async (request, response) => {
    console.log('Delete customer by id: ', request.params.customer_id)

    if (!request.params.customer_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var customer_id = request.params.customer_id;
    var customer = await Customer.find_by_id(customer_id)
    if (customer == null) {
        return response.json({ success: false, message: 'Customer not found', data: {} })
    }

    var deleted = await Customer.delete_by_id(customer_id)
    return response.json({ success: true, message: 'Customer deleted successfully.', data: { deleted: deleted } })
}

