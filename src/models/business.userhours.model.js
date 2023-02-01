const db = require('../config/db.config.js')
const BusinessUserHours = db.business_user_hours


// Create user hours
module.exports.create = async (new_business_user_hours) => {
	console.log("Create new business user hours")
	const created = await BusinessUserHours.create(new_business_user_hours)
	return created
}

module.exports.create_default_hours_for_user = async (user) => {
	console.log("Create new default user hours")

	var user_hours = null

	var new_business_user_hours = {
		business_user_id: user.id
	}
	new_business_user_hours.type = "WEEKDAY"
	new_business_user_hours.is_open = true

	new_business_user_hours.day = 1
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	new_business_user_hours.day = 2
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	new_business_user_hours.day = 3
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	new_business_user_hours.day = 4
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	new_business_user_hours.day = 5
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	new_business_user_hours.type = "WEEKEND"
	new_business_user_hours.is_open = false
	new_business_user_hours.day = 6
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	new_business_user_hours.type = "WEEKEND"
	new_business_user_hours.is_open = false
	new_business_user_hours.day = 7
	user_hours = await BusinessUserHours.create(new_business_user_hours)

	var all_user_hours = await BusinessUserHours.findAll({
		business_user_id: user.id
	})

	return all_user_hours
}

// Fetch all Users from database
module.exports.find_all = async (selector) => {
	console.log("Find all business user hours")

	const user_hours = await BusinessUserHours.findAll({
		where: selector
	})
	console.log("Total user hours found: ", user_hours.length)
	return user_hours
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find user hours by user hours id")
	const user_hours = await BusinessUserHours.findOne({
		where: { id: id}
	})
	return user_hours
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update user hours by user hours id")

	const udpated = await BusinessUserHours.update(
		update_fields,
		{ where: { id: id } }
	)
	const user_hours = await BusinessUserHours.findOne({
		where: { id: id }
	})
	return user_hours
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete user hours by user hours id")

	// const deleted = await BusinessUserHours.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await BusinessUserHours.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
