const db = require('../config/db.config.js')
const Business = db.businesses

// Create business
module.exports.create = async (new_business) => {

	console.log("Create new business")

	const business = await Business.create(new_business)
	return business
}

// Fetch all Users from databae
module.exports.find_all = async () => {

	console.log("Find all active businesses")

	const businesses = await Business.findAll({
		where: { is_active: true }
	})
	console.log("Total businesses found: ", businesses.length)
	return businesses
}

// Find One By id
module.exports.find_by_id = async (business_id) => {

	console.log("find business by business id")

	const business = await Business.findOne({
		where: { id: business_id, is_active: true }
	})

	return business
}

module.exports.find_by_mobile = async (mobile) => {

	console.log("find business by mobile number")

	const business = await Business.findOne({
		where: { mobile: mobile, is_active: true }
	})

	return business
}

module.exports.find_by_email = async (email) => {

	console.log("find business by email")

	const business = await Business.findOne({
		where: { email: email, is_active: true }
	})

	return business
}

// Update
module.exports.update = async (business_id, update_fields) => {

	console.log("Update business by business id")

	const udpated = await Business.update(
		update_fields,
		{ where: { id: business_id, is_active: true } }
	)

	const business = await Business.findOne({
		where: { id: business_id, is_active: true }
	})

	return business
}

// delete One By id
module.exports.delete_by_id = async (business_id) => {

	console.log("delete business by business id")
	
	const udpated = await Business.update(
		{ is_active: false },
		{ where: { id: business_id, is_active: true } }
	)

	return udpated
}
