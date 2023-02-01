const db = require('../config/db.config.js')
const UserMessage = db.user_messages


module.exports.create = async (new_user_message) => {
	console.log("Create new user_message")
	const created = await UserMessage.create(new_user_message)
	return created
}

module.exports.find_all = async (selector) => {
	console.log("Find all user messages")

	const user_messages = await UserMessage.findAll({
		where: selector
	})
	console.log("Total user messages found: ", user_messages.length)
	return user_messages
}

module.exports.find_by_id = async (id) => {
	console.log("find user_message by user_message id")
	const user_message = await UserMessage.findOne({
		where: { id: id}
	})
	return user_message
}

module.exports.update = async (id, update_fields) => {
	console.log("Update user_message by user_message id")

	const udpated = await UserMessage.update(
		update_fields,
		{ where: { id: id } }
	)
	const user_message = await UserMessage.findOne({
		where: { id: id }
	})
	return user_message
}

module.exports.delete_by_id = async (id) => {
	console.log("delete user_message by user_message id")

	// const deleted = await UserMessage.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await UserMessage.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
