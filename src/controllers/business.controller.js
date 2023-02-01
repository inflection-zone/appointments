const BusinessService = require('../models/business.service.model.js')
const BusinessNodeHours = require('../models/business.nodehours.model.js')
const Business = require('../models/business.model.js')
const BusinessNode = require('../models/business.node.model.js')
const Op = require('sequelize').Op;

// Create business
module.exports.create = async (request, response) => {
    console.log('Create new business: ', request.body)

    if (
        !request.body.name ||
        !request.body.mobile ||
        !request.body.email
    ) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    // Check if business already exist with same mobile
    var mobile = request.body.mobile
    var business = await Business.find_by_mobile(mobile)
    if (business) {
        console.log("Business with email already exist: ", mobile, " Id: ", business.id)
        return response.json({ success: false, message: 'Business already exists with mobile number: ' + mobile, data: {} })
    }

    // Check if business already exist with same email
    var email = request.body.email
    business = await Business.find_by_email(email)
    if (business) {
        console.log("Business with email already exist: ", email, " Id: ", business.id)
        return response.json({ success: false, message: 'Business already exists with email id: ' + email, data: {} })
    }

    let new_business = {}
    new_business.external_id = request.body.external_id
    new_business.name = request.body.name
    new_business.mobile = request.body.mobile
    new_business.email = request.body.email

    new_business.about_us = request.body.about_us ? request.body.about_us : null
    new_business.logo = request.body.logo ? request.body.logo : null
    new_business.display_picture = request.body.display_picture ? request.body.display_picture : ''
    new_business.address = request.body.address ? request.body.address : null
    new_business.api_key = getApiKey()

    new_business.facebook = request.body.facebook ? request.body.facebook : null
    new_business.linkedin = request.body.linkedin ? request.body.linkedin : null
    new_business.twitter = request.body.twitter ? request.body.twitter : null
    new_business.instagram = request.body.instagram ? request.body.instagram : null
    new_business.yelp = request.body.yelp ? request.body.yelp : null

    new_business.is_active = true

    var business = await Business.create(new_business)
    if(business == null){
        return response.json({ success: false, message: 'An error occurred while creating busines. Cannot create business!' + email, data: {} })
    }

    var default_business_node = await BusinessNode.create_default_for_business(business)
    var default_service_hours = await BusinessNodeHours.create_default_hours_for_node(default_business_node)

    return response.json({ success: true, message: 'Business profile created successfully.', data: { 
        business: business,
        default_business_node: default_business_node,
        default_service_hours: default_service_hours
    } })
}

// Find all businesses
module.exports.find_all = async (request, response) => {
    console.log('Get all businesses')

    var businesses = await Business.find_all()
    return response.json({ success: true, message: 'Business list', data: { businesses: businesses } })
}

// Find business by id
module.exports.find_by_id = async (request, response) => {

    var business_id = request.params.business_id
    console.log('Find business by id: ', business_id)

    if (!business_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business = await Business.find_by_id(business_id)

    return response.json({ success: true, message: 'Business', data: { business: business } })
}

// Update business by id
module.exports.update = async (request, response) => {
    console.log('Update business by id')

    var business_id = request.params.business_id
    if (!business_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business = await Business.find_by_id(business_id)
    if (!business) {
        return response.json({ success: false, message: 'Business not found for provided info.', data: {} })
    }

    if (request.body.hasOwnProperty('mobile')) {
        var mobile = request.body.mobile
        var other_entity = await Business.find_by_mobile(mobile)
        if (other_entity != null && other_entity.id != business.id) {
            console.log("Business with email already exist: ", mobile, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Business already exists with mobile number: ' + mobile, data: {} })
        }
    }
    if (request.body.hasOwnProperty('email')) {
        var email = request.body.email
        var other_entity = await Business.find_by_email(email)
        if (other_entity != null && other_entity.id != business.id) {
            console.log("Business with email already exist: ", email, " Id: ", other_entity.id)
            return response.json({ success: false, message: 'Business already exists with email id: ' + email, data: {} })
        }
    }

    var update_fields = get_update_fields(request)
    business = await Business.update(business_id, update_fields)

    return response.json({ success: true, message: 'Business profile updated successfully', data: { business: business } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('external_id')) {
        update_fields.external_id = request.body.external_id
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

    if (request.body.hasOwnProperty('about_us')) {
        update_fields.about_us = request.body.about_us
    }
    if (request.body.hasOwnProperty('logo')) {
        update_fields.logo = request.body.logo
    }
    if (request.body.hasOwnProperty('display_picture')) {
        update_fields.display_picture = request.body.display_picture
    }
    if (request.body.hasOwnProperty('address')) {
        update_fields.address = request.body.address
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

// Update business by id
module.exports.delete_by_id = async (request, response) => {
    var business_id = request.params.business_id
    console.log('Delete business by id: ', business_id)

    if (!business_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var deleted = await Business.delete_by_id(business_id)

    return response.json({ success: true, message: 'Business deleted successfully.', data: { deleted: deleted } })

}

function getApiKey() {
    var result = '';
    var length = 32;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))]

    return result
}