const BusinessUser = require('../models/business.user.model.js')
const BusinessUserHours = require('../models/business.userhours.model.js')
const BusinessNode = require('../models/business.node.model.js')
const UserService = require('../models/business.user.service.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

// Create user
module.exports.create = async (request, response) => {

    console.log('Create new user: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.prefix ||
        !request.body.mobile ||
        !request.body.email ||
        !request.body.gender) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_node_id = request.body.business_node_id
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    // Check if business already exist with same mobile
    var mobile = request.body.mobile
    var business_user = await BusinessUser.find_by_mobile(mobile)
    if (business_user) {
        console.log("Business user with email already exist: ", mobile, " Id: ", business_user.id)
        return response.json({ success: false, message: 'Business user already exists with mobile number: ' + mobile, data: {} })
    }

    // Check if business already exist with same email
    var email = request.body.email
    business_user = await BusinessUser.find_by_email(email)
    if (business_user) {
        console.log("Business user with email already exist: ", email, " Id: ", business_user.id)
        return response.json({ success: false, message: 'Business user already exists with email id: ' + email, data: {} })
    }

    var new_user = {}
    new_user.business_node_id = request.body.business_node_id

    new_user.first_name = request.body.first_name
    new_user.last_name = request.body.last_name
    new_user.prefix = request.body.prefix
    new_user.mobile = request.body.mobile
    new_user.email = request.body.email
    new_user.gender = request.body.gender

    new_user.dob = request.body.dob ? request.body.dob : null

    new_user.display_picture = request.body.display_picture ? request.body.display_picture : null
    new_user.about_me = request.body.about_me ? request.body.about_me : null
    new_user.qualification = request.body.qualification ? request.body.qualification : null
    new_user.experience = request.body.experience ? request.body.experience : null
    new_user.display_picture = request.body.display_picture ? request.body.display_picture : null

    new_user.overall_rating = null
    new_user.is_available_for_emergency = request.body.is_available_for_emergency ? request.body.is_available_for_emergency : true

    new_user.facebook = request.body.facebook ? request.body.facebook : null
    new_user.linkedin = request.body.linkedin ? request.body.linkedin : null
    new_user.twitter = request.body.twitter ? request.body.twitter : null
    new_user.instagram = request.body.instagram ? request.body.instagram : null
    new_user.yelp = request.body.yelp ? request.body.yelp : null

    new_user.is_active = true

    var user = await BusinessUser.create(new_user)
    var default_user_hours = await BusinessUserHours.create_default_hours_for_user(user)

    return response.json({
        success: true, message: 'Business user created', data: {
            user: user,
            default_user_hours: default_user_hours
        }
    })
}

// Get all users
module.exports.find_all = async (request, response) => {
    console.log('Get all users')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    const business_id = (typeof request.query.business_id != 'undefined') ? request.query.business_id : null;
    const service_id = (typeof request.query.service_id != 'undefined') ? request.query.service_id : null;
    const name = (typeof request.query.name != 'undefined') ? request.query.name : null;

    let users = [];
    if (business_node_id == null && business_id != null) {

        //Find the users for whole business if the node id is not specified
        var nodes = await BusinessNode.find_all({
            is_active: true,
            business_id: business_id
        });
        for await (const node of nodes) {
            var node_users = await BusinessUser.find_all({
                is_active: true,
                business_node_id: node.id
            })
            if (node_users.length > 0) {
                users.push(...node_users)
            }
        }
    }
    else if (business_node_id != null) {
        node = await BusinessNode.find_by_id(business_node_id);
        var node_users = await BusinessUser.find_all({
            is_active: true,
            business_node_id: node.id
        })
        if (node_users.length > 0) {
            users.push(...node_users)
        }
    }
    else if (business_node_id == null && business_id == null) {
        users = await BusinessUser.find_all({
            is_active: true
        })
    }

    //Filter the users by name
    if (name != null) {
        var users_with_matching_names = [];
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var nameTemp = name.toLowerCase();
            var firstNameLower = user.first_name.toLowerCase();
            var lastNameLower = user.last_name.toLowerCase();
            if (firstNameLower.includes(nameTemp) ||
                lastNameLower.includes(nameTemp) ||
                nameTemp.includes(firstNameLower) ||
                nameTemp.includes(lastNameLower) ||
                nameTemp == firstNameLower + ' ' + lastNameLower) {
                users_with_matching_names.push(user);
            }
        }
        users = users_with_matching_names
    }

    //Filter the users offering given service if service_id is specified

    if (service_id != null) {

        var users_with_services = []
        var user_services = await UserService.find_all({ b_service_id: service_id });

        if (user_services.length > 0) {

            var user_ids = user_services.map(function (el) { return el.b_user_id; });

            for (var user of users) {
                if (user_ids.includes(user.id)) {
                    users_with_services.push(user)
                }
            }
        }
        users = users_with_services
    }

    return response.json({ success: true, message: 'Found ' + users.length.toString() + 'users.', data: { users: users } })
}

// Find user by id
module.exports.find_by_id = async (request, response) => {

    var user_id = request.params.user_id
    console.log('Find user by id: ', user_id)

    if (!user_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var user = await BusinessUser.find_by_id(user_id)
    return response.json({ success: true, message: 'User found', data: { user: user } })
}

// Update user by id
module.exports.update = async (request, response) => {
    console.log('Update user by id')

    if (!request.params.user_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var user_id = request.params.user_id;
    var user = await BusinessUser.find_by_id(user_id)
    if (user == null) {
        return response.json({ success: false, message: 'User not found', data: {} })
    }

    if (request.body.hasOwnProperty('mobile')) {
        var mobile = request.body.mobile
        var other_entity = await BusinessUser.find_by_mobile(mobile)
        if (other_entity != null && other_entity.id != user.id) {
            console.log("Business user with email already exist: ", mobile, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Business user already exists with mobile number: ' + mobile, data: {} })
        }
    }
    if (request.body.hasOwnProperty('email')) {
        var email = request.body.email
        var other_entity = await BusinessUser.find_by_email(email)
        if (other_entity != null && other_entity.id != user.id) {
            console.log("Business user with email already exist: ", email, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Business user already exists with email id: ' + email, data: {} })
        }
    }

    var update_fields = get_update_fields(request)
    var updated = await BusinessUser.update(user_id, update_fields)
    return response.json({ success: true, message: 'User updated successfully', data: { user: updated } })
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

    if (request.body.hasOwnProperty('display_picture')) {
        update_fields.display_picture = request.body.display_picture
    }
    if (request.body.hasOwnProperty('about_me')) {
        update_fields.about_me = request.body.about_me
    }
    if (request.body.hasOwnProperty('qualification')) {
        update_fields.qualification = request.body.qualification
    }
    if (request.body.hasOwnProperty('experience')) {
        update_fields.experience = request.body.experience
    }
    if (request.body.hasOwnProperty('dob')) {
        update_fields.dob = request.body.dob
    }
    if (request.body.hasOwnProperty('gender')) {
        update_fields.gender = request.body.gender
    }

    if (request.body.hasOwnProperty('is_available_for_emergency')) {
        update_fields.is_available_for_emergency = request.body.is_available_for_emergency
    }

    if (request.body.hasOwnProperty('facebook')) {
        update_fields.facebook = request.body.facebook
    }
    if (request.body.hasOwnProperty('linkedin')) {
        update_fields.linkedin = request.body.linkedin
    }
    if (request.body.hasOwnProperty('twitter')) {
        update_fields.twitter = request.body.twitter
    }
    if (request.body.hasOwnProperty('instagram')) {
        update_fields.instagram = request.body.instagram
    }
    if (request.body.hasOwnProperty('yelp')) {
        update_fields.yelp = request.body.yelp
    }

    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

// Update user by id
module.exports.delete_by_id = async (request, response) => {
    console.log('Delete user by id: ', request.params.user_id)

    if (!request.params.user_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var user_id = request.params.user_id;
    var user = await BusinessUser.find_by_id(user_id)
    if (user == null) {
        return response.json({ success: false, message: 'User not found', data: {} })
    }

    var deleted = await BusinessUser.delete_by_id(user_id)
    return response.json({ success: true, message: 'User deleted successfully.', data: { deleted: deleted } })
}

