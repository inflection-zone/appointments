const db = require('../config/db.config.js')
const Notification = db.notifications


module.exports.create = async (new_notification) => {
	console.log("Create new notification")
	const created = await Notification.create(new_notification)
	return created
}

module.exports.find_all = async (selector) => {
	console.log("Find all notifications")

	const notifications = await Notification.findAll({
		where: selector
	})
	console.log("Total notifications found: ", notifications.length)
	return notifications
}

module.exports.find_by_id = async (id) => {
	console.log("find notification by notification id")
	const notification = await Notification.findOne({
		where: { id: id}
	})
	return notification
}

module.exports.update = async (id, update_fields) => {
	console.log("Update notification by notification id")

	const udpated = await Notification.update(
		update_fields,
		{ where: { id: id } }
	)
	const notification = await Notification.findOne({
		where: { id: id }
	})
	return notification
}

module.exports.delete_by_id = async (id) => {
	console.log("delete notification by notification id")

	// const deleted = await Notification.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await Notification.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
