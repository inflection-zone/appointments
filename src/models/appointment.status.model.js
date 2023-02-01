const db = require('../config/db.config.js')
const AppointmentStatus = db.appointment_statuses


// Create appointment_status
module.exports.create = async (new_appointment_status) => {
	console.log("Create new appointment_status")
	const created = await AppointmentStatus.create(new_appointment_status)
	return created
}

// Fetch all Users from databae
module.exports.find_all = async (selector) => {
	console.log("Find all appointment statuses")

	const appointment_statuses = await AppointmentStatus.findAll({
		where: selector
	})
	console.log("Total appointment statuses found: ", appointment_statuses.length)
	return appointment_statuses
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find appointment_status by appointment_status id")
	const appointment_status = await AppointmentStatus.findOne({
		where: { id: id}
	})
	return appointment_status
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update appointment_status by appointment_status id")

	const udpated = await AppointmentStatus.update(
		update_fields,
		{ where: { id: id } }
	)
	const appointment_status = await AppointmentStatus.findOne({
		where: { id: id }
	})
	return appointment_status
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete appointment_status by appointment_status id")

	const deleted = await AppointmentStatus.destroy(
		{ where: { id: id } }
	)

	return deleted
}
