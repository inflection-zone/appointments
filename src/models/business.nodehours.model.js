const db = require('../config/db.config.js')
const BusinessNodeHours = db.business_node_hours


module.exports.create = async (new_business_node_hours) => {
	console.log("Create new business node hours")
	const created = await BusinessNodeHours.create(new_business_node_hours)
	return created
}

module.exports.create_default_hours_for_node = async (node) => {
	console.log("Create new default business node hours")

	var node_hours = null

	var new_business_node_hours = {
		business_node_id: node.id
	}
	new_business_node_hours.type = "WEEKDAY"
	new_business_node_hours.is_open = true

	new_business_node_hours.day = 1
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	new_business_node_hours.day = 2
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	new_business_node_hours.day = 3
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	new_business_node_hours.day = 4
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	new_business_node_hours.day = 5
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	new_business_node_hours.type = "WEEKEND"
	new_business_node_hours.is_open = false
	new_business_node_hours.day = 6
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	new_business_node_hours.type = "WEEKEND"
	new_business_node_hours.is_open = false
	new_business_node_hours.day = 7
	node_hours = await BusinessNodeHours.create(new_business_node_hours)

	var all_node_hours = await BusinessNodeHours.findAll(
		{
			where:
			{
				business_node_id: node.id
			}
		}
	)

	return all_node_hours
}

module.exports.find_all = async (selector) => {
	console.log("Find all business node hours")

	const node_hours = await BusinessNodeHours.findAll({
		where: selector
	})
	console.log("Total node hours found: ", node_hours.length)
	return node_hours
}

module.exports.find_by_id = async (id) => {
	console.log("find node hours by node hours id")
	const node_hours = await BusinessNodeHours.findOne({
		where: { id: id}
	})
	return node_hours
}

module.exports.update = async (id, update_fields) => {
	console.log("Update node hours by node hours id")

	const udpated = await BusinessNodeHours.update(
		update_fields,
		{ where: { id: id } }
	)
	const node_hours = await BusinessNodeHours.findOne({
		where: { id: id }
	})
	return node_hours
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete node hours by node hours id")

	// const deleted = await BusinessNodeHours.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await BusinessNodeHours.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
