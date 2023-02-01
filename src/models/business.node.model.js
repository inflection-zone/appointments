const db = require('../config/db.config.js')
const BusinessNode = db.business_nodes


// Create node
module.exports.create = async (new_node) => {
	console.log("Create new node")
	const created = await BusinessNode.create(new_node)
	return created
}

module.exports.create_default_for_business = async (business) => {
	console.log("Create new default node for business")

	var new_node = {}
    new_node.business_id = business.id
    new_node.name = business.name
    new_node.mobile = business.mobile
    new_node.email = business.email
    new_node.display_picture = business.display_picture
    new_node.address = business.address
    new_node.allow_walkin_appointments = true
    new_node.is_active = true

	const created = await BusinessNode.create(new_node)
	return created
}

// Fetch all Users from databae
module.exports.find_all = async (selector) => {
	console.log("Find all nodes")

	const nodes = await BusinessNode.findAll({
		where: selector
	})
	console.log("Total nodes found: ", nodes.length)
	return nodes
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find node by node id")
	const node = await BusinessNode.findOne({
		where: { id: id}
	})
	return node
}


module.exports.find_by_mobile = async (mobile) => {

	console.log("find business node by mobile number")

	const business = await BusinessNode.findOne({
		where: { mobile: mobile, is_active: true }
	})

	return business
}

module.exports.find_by_email = async (email) => {

	console.log("find business node by email")

	const business = await BusinessNode.findOne({
		where: { email: email, is_active: true }
	})

	return business
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update node by node id")

	const udpated = await BusinessNode.update(
		update_fields,
		{ where: { id: id } }
	)
	const node = await BusinessNode.findOne({
		where: { id: id }
	})
	return node
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete node by node id")

	// const deleted = await BusinessNode.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await BusinessNode.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
