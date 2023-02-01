const db = require('../config/db.config.js')
const BusinessUser = db.business_users


// Create user
module.exports.create = async (new_user) => {
	console.log("Create new user")
	const created = await BusinessUser.create(new_user)
	return created
}

// Fetch all Users from databae
module.exports.find_all = async (selector) => {
	console.log("Find all users")

	const users = await BusinessUser.findAll({
		where: selector
	})
	console.log("Total users found: ", users.length)
	return users
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find user by user id")
	const user = await BusinessUser.findOne({
		where: { id: id}
	})
	return user
}

module.exports.find_by_mobile = async (mobile) => {

	console.log("find business user by mobile number")

	const business = await BusinessUser.findOne({
		where: { mobile: mobile, is_active: true }
	})

	return business
}

module.exports.find_by_email = async (email) => {

	console.log("find business user by email")

	const business = await BusinessUser.findOne({
		where: { email: email, is_active: true }
	})

	return business
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update user by user id")

	const udpated = await BusinessUser.update(
		update_fields,
		{ where: { id: id } }
	)
	const user = await BusinessUser.findOne({
		where: { id: id }
	})
	return user
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete user by user id")

	// const deleted = await BusinessUser.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await BusinessUser.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
