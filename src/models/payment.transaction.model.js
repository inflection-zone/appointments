const db = require('../config/db.config.js')
const PaymentTransaction = db.payment_transactions


module.exports.create = async (new_customer) => {
	console.log("Create new payment_transaction")
	const created = await PaymentTransaction.create(new_customer)
	return created
}

module.exports.find_all = async (selector) => {
	console.log("Find all payment_transactions")

	const payment_transactions = await PaymentTransaction.findAll({
		where: selector
	})
	console.log("Total payment_transactions found: ", payment_transactions.length)
	return payment_transactions
}

module.exports.find_by_id = async (id) => {
	console.log("find payment_transaction by payment_transaction id")
	const payment_transaction = await PaymentTransaction.findOne({
		where: { id: id}
	})
	return payment_transaction
}

module.exports.update = async (id, update_fields) => {
	console.log("Update payment_transaction by payment_transaction id")

	const udpated = await PaymentTransaction.update(
		update_fields,
		{ where: { id: id } }
	)
	const payment_transaction = await PaymentTransaction.findOne({
		where: { id: id }
	})
	return payment_transaction
}

module.exports.delete_by_id = async (id) => {
	console.log("delete payment_transaction by payment_transaction id")

	// const deleted = await PaymentTransaction.destroy(
	// 	{ where: { id: id } }
	// )
	const deleted = await PaymentTransaction.update(
		{ is_active: false },
		{ where: { id: id, is_active: true } }
	)
	return deleted
}
