const db = require('../config/db.config.js')
const Appointment = db.appointments


// Create appointment
module.exports.create = async (new_appointment) => {
	console.log("Create new appointment")
	const created = await Appointment.create(new_appointment)
	return created
}

// Fetch all Users from databae
module.exports.find_all = async (selector) => {
	console.log("Find all appointments")

	const appointments = await Appointment.findAll({
		where: selector
	})
	console.log("Total appointments found: ", appointments.length)
	return appointments
}

// Find One By id
module.exports.find_by_id = async (id) => {
	console.log("find appointment by appointment id")
	const appointment = await Appointment.findOne({
		where: { id: id}
	})
	return appointment
}

module.exports.find_by_display_id = async (display_id) => {
	console.log("find appointment by appointment display id")
	const appointment = await Appointment.findOne({
		where: { display_id: display_id}
	})
	return appointment
}

// Update
module.exports.update = async (id, update_fields) => {
	console.log("Update appointment by appointment id")

	const udpated = await Appointment.update(
		update_fields,
		{ where: { id: id } }
	)
	const appointment = await Appointment.findOne({
		where: { id: id }
	})
	return appointment
}

// delete One By id
module.exports.delete_by_id = async (id) => {
	console.log("delete appointment by appointment id")

	const deleted = await Appointment.destroy(
		{ where: { id: id } }
	)

	return deleted
}
