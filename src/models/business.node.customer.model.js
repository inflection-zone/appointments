const db = require('../config/db.config.js')
const BusinessNodeCustomer = db.business_node_customers


module.exports.create = async (new_business_node_customer) => {
	console.log("Create new business node customer")
	const created = await BusinessNodeCustomer.create(new_business_node_customer)
	return created
}

module.exports.find_all = async (selector) => {
	console.log("Find all business node customer")

	const node_customer = await BusinessNodeCustomer.findAll({
		where: selector
	})
	console.log("Total node customer found: ", node_customer.length)
	return node_customer
}

module.exports.find_by_id = async (id) => {
	console.log("find node customer by node customer id")
	const node_customer = await BusinessNodeCustomer.findOne({
		where: { id: id}
	})
	return node_customer
}

module.exports.update = async (id, update_fields) => {
	console.log("Update node customer by node customer id")

	const udpated = await BusinessNodeCustomer.update(
		update_fields,
		{ where: { id: id } }
	)
	const node_customer = await BusinessNodeCustomer.findOne({
		where: { id: id }
	})
	return node_customer
}

module.exports.delete_by_id = async (id) => {
	console.log("delete node customer by node customer id")

	const deleted = await BusinessNodeCustomer.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
