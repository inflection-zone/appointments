const db = require('../config/db.config.js')
const BusinessService = db.business_services


// Create service
module.exports.create = async (new_service) => {
	console.log("Create new service")
	const created_service = await BusinessService.create(new_service)
	return created_service
}

// Fetch all Users from databae
module.exports.find_all = async (selector) => {
	console.log("Find all services")

	const services = await BusinessService.findAll({
		where: selector
	})
	console.log("Total services found: ", services.length)
	return services
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find service by service id")
	const service = await BusinessService.findOne({
		where: { id: id}
	})
	return service
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update service by service id")

	const udpated = await BusinessService.update(
		update_fields,
		{ where: { id: id } }
	)
	const service = await BusinessService.findOne({
		where: { id: id }
	})
	return service
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete service by service id")

	// const deleted = await BusinessService.destroy(
	// 	{ where: { id: id } }
	// )

	const deleted = await BusinessService.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)

	return deleted
}
