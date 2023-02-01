const db = require('../config/db.config.js')
const Customer = db.customers


module.exports.create = async (new_customer) => {
	console.log("Create new customer")
	const created = await Customer.create(new_customer)
	return created
}

module.exports.find_all = async (selector) => {
	console.log("Find all customers")

	const customers = await Customer.findAll({
		where: selector
	})
	console.log("Total customers found: ", customers.length)
	return customers
}

module.exports.find_by_id = async (id) => {
	console.log("find customer by customer id")
	const customer = await Customer.findOne({
		where: { id: id}
	})
	return customer
}

module.exports.find_by_mobile = async (mobile) => {

	console.log("find customer by mobile number")

	const customer = await Customer.findOne({
		where: { mobile: mobile, is_active: true }
	})

	return customer
}

module.exports.find_by_email = async (email) => {

	console.log("find customer by email")

	const customer = await Customer.findOne({
		where: { email: email, is_active: true }
	})

	return customer
}

module.exports.update = async (id, update_fields) => {
	console.log("Update customer by customer id")

	const udpated = await Customer.update(
		update_fields,
		{ where: { id: id } }
	)
	const customer = await Customer.findOne({
		where: { id: id }
	})
	return customer
}

module.exports.delete_by_id = async (id) => {
	console.log("delete customer by customer id")

	// const deleted = await Customer.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await Customer.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
