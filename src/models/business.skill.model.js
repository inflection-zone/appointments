const db = require('../config/db.config.js')
const BusinessSkill = db.business_skills


// Create skill
module.exports.create = async (new_skill) => {
	console.log("Create new skill")
	const created = await BusinessSkill.create(new_skill)
	return created
}

// Fetch all Users from databae
module.exports.find_all = async (selector) => {
	console.log("Find all skills")

	const skills = await BusinessSkill.findAll({
		where: selector
	})
	console.log("Total skills found: ", skills.length)
	return skills
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find skill by skill id")
	const skill = await BusinessSkill.findOne({
		where: { id: id}
	})
	return skill
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update skill by skill id")

	const udpated = await BusinessSkill.update(
		update_fields,
		{ where: { id: id } }
	)
	const skill = await BusinessSkill.findOne({
		where: { id: id }
	})
	return skill
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete skill by skill id")

	// const deleted = await BusinessSkill.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await BusinessSkill.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
