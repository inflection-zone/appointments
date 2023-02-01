const BusinessUserSkill = require('../models/business.user.skill.model.js')
const BusinessUser = require('../models/business.user.model.js')
const BusinessSkill = require('../models/business.skill.model.js')
const Op = require('sequelize').Op;
const moment = require('moment')

module.exports.create = async (request, response) => {

    console.log('Create new user: ', request.body)

    if (
        !request.body.business_user_id ||
        !request.body.business_skill_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var business_user_id = request.body.business_user_id
    var business_user = await BusinessUser.find_by_id(business_user_id)
    if (!business_user) {
        var message = "Business user with id " + business_user_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }
    var business_skill_id = request.body.business_skill_id
    var business_skill = await BusinessSkill.find_by_id(business_skill_id)
    if (!business_skill) {
        var message = "Business skill with id " + business_skill_id.toString() + " does not exist!"
        console.log(message)
        return response.json({ success: false, message: message, data: {} })
    }

    var new_skill = {}
    new_skill.business_user_id = request.body.business_user_id
    new_skill.business_skill_id = request.body.business_skill_id
    new_skill.is_active = request.body.is_active ? request.body.is_active : true

    var existing = await BusinessUserSkill.find_all({
        business_user_id: business_user_id, 
        business_skill_id: business_skill_id
    })
    if(existing.length > 0)
    {
        var message = "User skill with skill id " + 
        business_skill_id.toString() + " and user id " + + business_user_id.toString() + " already exists!";
        console.log(message);
        return response.json({ success: false, message: message, data: {existing: existing[0]} });
    }

    var skill = await BusinessUserSkill.create(new_skill)

    return response.json({
        success: true, message: 'User skill created', data: {
            skill: skill,
        }
    })
}

module.exports.create_multiple = async (request, response) => {
    console.log('Create multiple users skills.')

    if (
        !request.body.skills || request.body.skills.length == 0) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {skills: request.body.skills} })
    }

    var skills = []
    var new_user_skills = request.body.skills

    var alreadyExists = false;
    var warning_messages = [];

    for await (const s of new_user_skills) {
        var business_user_id = s.business_user_id

        var business_user = await BusinessUser.find_by_id(business_user_id)
        if (!business_user) {
            var message = "Business user with id " + business_user_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }

        var business_skill_id = s.business_skill_id
        var business_user_skill = await BusinessSkill.find_by_id(business_skill_id)
        if (!business_user_skill) {
            var message = "Business skill with id " + business_skill_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
        //Check for existing...
        var existing = await BusinessUserSkill.find_all({
            business_user_id: business_user_id,
            business_skill_id: business_skill_id
        })
        if (existing.length > 0) {
            alreadyExists = true;
            var message = "User skill with skill id " + 
            business_skill_id.toString() + " and user id " + + business_user_id.toString() + " already exists!";
            warning_messages.push(message)
            continue;
        }
        var new_user_skill = {}
        new_user_skill.business_user_id = s.business_user_id
        new_user_skill.business_skill_id = s.business_skill_id
        new_user_skill.is_active = s.is_active ? s.is_active : true

        var skill = await BusinessUserSkill.create(new_user_skill)
        skills.push(skill)
    }

    if(!alreadyExists){
        return response.json({
            success: true, message: skills.length.toString() + ' user skills created', data: {
                skills: skills
            }
        })
    }
    else {
        return response.json({
            success: true, message: skills.length.toString() + ' user skills created', data: {
                skills: skills,
                warning_messages: warning_messages
            }
        })
    }
}

module.exports.find_all = async (request, response) => {
    console.log('Get all skills')

    const business_user_id = (typeof request.query.business_user_id != 'undefined') ? request.query.business_user_id : null;
    const business_skill_id = (typeof request.query.business_skill_id != 'undefined') ? request.query.business_skill_id : null;

    if (business_user_id != null) {
        var business_user = await BusinessUser.find_by_id(business_user_id)
        if (business_user == null) {
            var message = "Business node with id " + business_user_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }
    if (business_skill_id != null) {
        var business_skill = await BusinessSkill.find_by_id(business_skill_id)
        if (!business_skill) {
            var message = "Business skill with id " + business_skill_id.toString() + " does not exist!"
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
    if (business_skill_id != null) {
        selector.business_skill_id = business_skill_id
    }

    var skills = await BusinessUserSkill.find_all(selector);

    return response.json({ success: true, message: 'User skills list', data: { skills: skills } })
}

module.exports.find_by_id = async (request, response) => {

    var skill_id = request.params.skill_id
    console.log('Find user by id: ', skill_id)

    if (!skill_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }
    var skill = await BusinessUserSkill.find_by_id(skill_id)
    return response.json({ success: true, message: 'Skill', data: { skill: skill } })
}

module.exports.update = async (request, response) => {
    console.log('Update skill by id')

    if (!request.params.skill_id) {
        return response.json({ success: false, message: 'Missing required parameters.', data: {} })
    }

    var skill_id = request.params.skill_id;
    var skill = await BusinessUserSkill.find_by_id(skill_id)
    if (skill == null) {
        return response.json({ success: false, message: 'Skill not found', data: {} })
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
    if (request.body.hasOwnProperty('business_skill_id')) {
        var business_skill_id = request.body.business_skill_id
        var business_skill = await BusinessSkill.find_by_id(business_skill_id)
        if (!business_skill) {
            var message = "Business skill with id " + business_skill_id.toString() + " does not exist!"
            console.log(message)
            return response.json({ success: false, message: message, data: {} })
        }
    }

    var update_fields = get_update_fields(request)
    var updated = await BusinessUserSkill.update(skill_id, update_fields)
    skill = await BusinessUserSkill.find_by_id(skill_id)

    return response.json({ success: true, message: 'Skill updated successfully', data: { skill: skill } })
}

function get_update_fields(request) {

    var update_fields = {}

    if (request.body.hasOwnProperty('business_user_id')) {
        update_fields.business_user_id = request.body.business_user_id
    }
    if (request.body.hasOwnProperty('business_skill_id')) {
        update_fields.business_skill_id = request.body.business_skill_id
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
    var skill = await BusinessUserSkill.find_by_id(skill_id)
    if (skill == null) {
        return response.json({ success: false, message: 'Skill not found', data: {} })
    }

    var deleted = await BusinessUserSkill.delete_by_id(skill_id)
    return response.json({ success: true, message: 'Skill deleted successfully.', data: { deleted: deleted } })
}

