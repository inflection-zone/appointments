const db = require('../config/db.config.js')
const BusinessUserService = db.business_user_services

module.exports.create = async (new_service) => {
	console.log("Create new user service")
	const created = await BusinessUserService.create(new_service)
	return created
}

module.exports.find_all = async (selector) => {
	console.log("Find all user services")

	const services = await BusinessUserService.findAll({
		where: selector
	})
	console.log("Total user services found: ", services.length)
	return services
}

module.exports.find_by_id = async (id) => {
	console.log("find user service by id")
	const service = await BusinessUserService.findOne({
		where: { id: id}
	})
	return service
}

module.exports.update = async (id, update_fields) => {
	console.log("Update user service by id")

	const udpated = await BusinessUserService.update(
		update_fields,
		{ where: { id: id } }
	)
	const service = await BusinessUserService.findOne({
		where: { id: id }
	})
	return service
}

module.exports.delete_by_id = async (id) => {
	console.log("delete user service by id")

	const deleted = await BusinessUserService.destroy(
		{ where: { id: id } }
	)

	return deleted
}
