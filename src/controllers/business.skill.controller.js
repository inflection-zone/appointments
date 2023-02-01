const BusinessSkill = require('../models/business.skill.model.js')
const BusinessNode = require('../models/business.node.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new user: ', request.body)

    if (
        !request.body.business_node_id ||
        !request.body.name ||
        !request.body.description) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_node_id = request.body.business_node_id
    var business_node = await BusinessNode.find_by_id(business_node_id)
    if (!business_node) {
        var message = "Business node with id " + business_node_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var new_skill = {}
    new_skill.business_node_id = request.body.business_node_id
    new_skill.name = request.body.name
    new_skill.description = request.body.description
    new_skill.display_picture = request.body.display_picture ? request.body.display_picture : null
    new_skill.is_active = request.body.is_active ? request.body.is_active : true

    var skill = await BusinessSkill.create(new_skill)

    return response.json({
        success: true, message: 'Business skill created', data: {
            skill: skill,
        }
    })
}

module.exports.find_all = async (request, response) => {
    console.log('Get all skills')

    const business_node_id = (typeof request.query.business_node_id != 'undefined') ? request.query.business_node_id : null;
    const name = (typeof request.query.name != 'undefined') ? request.query.name : null;

    if (business_node_id != null) {
        var business_node = await BusinessNode.find_by_id(business_node_id)
        if (business_node == null) {
            var message = "Business node with id " + business_node_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var selector = {
        is_active: true
    }
    if (business_node_id != null) {
        selector.business_node_id = business_node_id
    }
    if (name != null) {
        selector.name = { [Op.like]: '%' + name + '%' }
    }

    var skills = await BusinessSkill.find_all(selector);

    return response.json({ success: true, message: 'Business skills list', data: { skills: skills } })
}

module.exports.find_by_id = async (request, response) => {

    var skill_id = request.params.skill_id
    console.log('Find user by id: ', skill_id)

    if (!skill_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var skill = await BusinessSkill.find_by_id(skill_id)
    return response.json({ success: true, message: 'Skill', data: { skill: skill } })
}

module.exports.update = async (request, response) => {
    console.log('Update skill by id')

    if (!request.params.skill_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var skill_id = request.params.skill_id;
    var skill = await BusinessSkill.find_by_id(skill_id)
    if (skill == null) {
        return response.json({ success: false, message: 'Skill not found', data: {} })
    }

    if (request.body.hasOwnProperty('business_node_id')) {
        var business_node_id = request.body.business_node_id
        var business_node = await BusinessNode.find_by_id(business_node_id)
        if (!business_node) {
            var message = "Business node with id " + business_node_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var update_fields = get_update_fields(request)
    var updated = await BusinessSkill.update(skill_id, update_fields)
    skill = await BusinessSkill.find_by_id(skill_id)

    return response.json({ success: true, message: 'Skill updated successfully', data: { skill: skill } })
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
    if (request.body.hasOwnProperty('display_picture')) {
        update_fields.display_picture = request.body.display_picture
    }
    if (request.body.hasOwnProperty('is_active')) {
        update_fields.is_active = request.body.is_active
    }
    return update_fields
}

module.exports.delete_by_id = async (request, response) => {
    console.log('Delete skill by id: ', request.params.skill_id)

    if (!request.params.skill_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var skill_id = request.params.skill_id;
    var skill = await BusinessSkill.find_by_id(skill_id)
    if (skill == null) {
        return response.json({ success: false, message: 'Skill not found', data: {} })
    }

    var deleted = await BusinessSkill.delete_by_id(skill_id)
    return response.json({ success: true, message: 'Skill deleted successfully.', data: { deleted: deleted } })
}

