const router = require("express-promise-router")()
const config = require('../config/config.js')

// ------------------------- include all controllers here ----------------------------
const commonController = require('../controllers/common.controller.js')
const businessController = require('../controllers/business.controller.js')
const businessNodeController = require('../controllers/business.node.controller.js')
const businessServiceController = require('../controllers/business.service.controller.js')
const businessNodeHoursController = require('../controllers/business.nodehours.controller.js')
const businessUserHoursController = require('../controllers/business.userhours.controller.js')
const businessUserController = require('../controllers/business.user.controller.js')

const businessSkillController = require('../controllers/business.skill.controller.js')
const businessUserSkillController = require('../controllers/business.user.skill.controller.js')
const businessUserServiceController = require('../controllers/business.user.service.controller.js')
const userMessageController = require('../controllers/user.message.controller.js')
const notificationController = require('../controllers/notification.controller.js')
const paymentTransactionController = require('../controllers/payment.transaction.controller.js')
const customerController = require('../controllers/customer.controller.js')

const appointmentController = require('../controllers/appointment.controller.js')
const appointmentStatusController = require('../controllers/appointment.status.controller.js')

//const cronController = require('../controllers/cron.controller.js')

// middleware to validate incmoing request token
function validate_token(request, response, next) {

    let requestApiKey = request.headers["x-api-key"]

    // console.log('\nIncoming api key: ' + requestApiKey)
    // var requestHeadersStr = JSON.stringify(request.headers, null, 2)
    // console.log(requestHeadersStr)
    console.log('\nIncoming api key: ' + requestApiKey)
    console.log('\nGlobal api key: ' + config.GLOBAL_API_KEY)

    if (requestApiKey !== config.GLOBAL_API_KEY) {
        return response.status(403).json({ success: false, message: 'API Key is required', data: null })
    } else {
        //console.log('\nApi key validated')
        next()
    }

}

// all routes goes inside
router.get('/ping', commonController.ping)

// Business Routes
router.post('/api/business', validate_token, businessController.create)
router.get('/api/business/list', validate_token, businessController.find_all)
router.get('/api/business/:business_id', validate_token, businessController.find_by_id)
router.put('/api/business/:business_id', validate_token, businessController.update)
router.delete('/api/business/:business_id', validate_token, businessController.delete_by_id)

router.post('/api/business-node', validate_token, businessNodeController.create)
router.get('/api/business-node/list', validate_token, businessNodeController.find_all)
router.get('/api/business-node/:node_id', validate_token, businessNodeController.find_by_id)
router.put('/api/business-node/:node_id', validate_token, businessNodeController.update)
router.delete('/api/business-node/:node_id', validate_token, businessNodeController.delete_by_id)

router.post('/api/business-service', validate_token, businessServiceController.create)
router.get('/api/business-service/list-by-business/:business_id', validate_token, businessServiceController.find_all_by_business)
router.get('/api/business-service/list', validate_token, businessServiceController.find_all)
router.get('/api/business-service/:service_id', validate_token, businessServiceController.find_by_id)
router.put('/api/business-service/:service_id', validate_token, businessServiceController.update)
router.delete('/api/business-service/:service_id', validate_token, businessServiceController.delete_by_id)

router.post('/api/business-node-hours', validate_token, businessNodeHoursController.create)
router.post('/api/business-node-hours/add-multiple', validate_token, businessNodeHoursController.create_multiple)
router.get('/api/business-node-hours/list', validate_token, businessNodeHoursController.find_all)
router.get('/api/business-node-hours/:nodehours_id', validate_token, businessNodeHoursController.find_by_id)
router.put('/api/business-node-hours/:nodehours_id', validate_token, businessNodeHoursController.update)
router.put('/api/business-node-hours/update-multiple/:business_node_id', validate_token, businessNodeHoursController.update_multiple)
router.delete('/api/business-node-hours/:nodehours_id', validate_token, businessNodeHoursController.delete_by_id)

router.post('/api/business-user-hours', validate_token, businessUserHoursController.create)
router.post('/api/business-user-hours/add-multiple', validate_token, businessUserHoursController.create_multiple)
router.get('/api/business-user-hours/list', validate_token, businessUserHoursController.find_all)
router.get('/api/business-user-hours/:userhours_id', validate_token, businessUserHoursController.find_by_id)
router.put('/api/business-user-hours/:userhours_id', validate_token, businessUserHoursController.update)
router.put('/api/business-user-hours/update-multiple/:business_user_id', validate_token, businessUserHoursController.update_multiple)
router.delete('/api/business-user-hours/:userhours_id', validate_token, businessUserHoursController.delete_by_id)

router.post('/api/business-user', validate_token, businessUserController.create)
router.get('/api/business-user/list', validate_token, businessUserController.find_all)
router.get('/api/business-user/:user_id', validate_token, businessUserController.find_by_id)
router.put('/api/business-user/:user_id', validate_token, businessUserController.update)
router.delete('/api/business-user/:user_id', validate_token, businessUserController.delete_by_id)

router.post('/api/business-skill', validate_token, businessSkillController.create)
router.get('/api/business-skill/list', validate_token, businessSkillController.find_all)
router.get('/api/business-skill/:skill_id', validate_token, businessSkillController.find_by_id)
router.put('/api/business-skill/:skill_id', validate_token, businessSkillController.update)
router.delete('/api/business-skill/:skill_id', validate_token, businessSkillController.delete_by_id)

router.post('/api/user-skill', validate_token, businessUserSkillController.create)
router.post('/api/user-skill/add-multiple', validate_token, businessUserSkillController.create_multiple)
router.get('/api/user-skill/list', validate_token, businessUserSkillController.find_all)
router.get('/api/user-skill/:skill_id', validate_token, businessUserSkillController.find_by_id)
router.put('/api/user-skill/:skill_id', validate_token, businessUserSkillController.update)
router.delete('/api/user-skill/:skill_id', validate_token, businessUserSkillController.delete_by_id)

router.post('/api/user-service', validate_token, businessUserServiceController.create)
router.post('/api/user-service/add-multiple', validate_token, businessUserServiceController.create_multiple)
router.get('/api/user-service/list', validate_token, businessUserServiceController.find_all)
router.get('/api/user-service/:user_service_id', validate_token, businessUserServiceController.find_by_id)
router.put('/api/user-service/:user_service_id', validate_token, businessUserServiceController.update)
router.delete('/api/user-service/:user_service_id', validate_token, businessUserServiceController.delete_by_id)

router.post('/api/user-message', validate_token, userMessageController.create)
router.get('/api/user-message/list', validate_token, userMessageController.find_all)
router.get('/api/user-message/:message_id', validate_token, userMessageController.find_by_id)
router.put('/api/user-message/:message_id', validate_token, userMessageController.update)
router.delete('/api/user-message/:message_id', validate_token, userMessageController.delete_by_id)

router.post('/api/notification', validate_token, notificationController.create)
router.get('/api/notification/list', validate_token, notificationController.find_all)
router.get('/api/notification/:notification_id', validate_token, notificationController.find_by_id)
router.put('/api/notification/:notification_id', validate_token, notificationController.update)
router.delete('/api/notification/:notification_id', validate_token, notificationController.delete_by_id)

router.post('/api/payment-transaction', validate_token, paymentTransactionController.create)
router.get('/api/payment-transaction/list', validate_token, paymentTransactionController.find_all)
router.get('/api/payment-transaction/:transaction_id', validate_token, paymentTransactionController.find_by_id)
router.put('/api/payment-transaction/:transaction_id', validate_token, paymentTransactionController.update)
router.delete('/api/payment-transaction/:transaction_id', validate_token, paymentTransactionController.delete_by_id)

router.post('/api/customer', validate_token, customerController.create)
router.get('/api/customer/list', validate_token, customerController.find_all)
router.get('/api/customer/:customer_id', validate_token, customerController.find_by_id)
router.put('/api/customer/:customer_id', validate_token, customerController.update)
router.delete('/api/customer/:customer_id', validate_token, customerController.delete_by_id)

router.post('/api/appointment-status', validate_token, appointmentStatusController.create)
router.post('/api/appointment-status/add-multiple', validate_token, appointmentStatusController.create_multiple)
router.get('/api/appointment-status/list', validate_token, appointmentStatusController.find_all)
router.get('/api/appointment-status/:status_id', validate_token, appointmentStatusController.find_by_id)
router.put('/api/appointment-status/:status_id', validate_token, appointmentStatusController.update)
router.delete('/api/appointment-status/:status_id', validate_token, appointmentStatusController.delete_by_id)

router.get('/api/appointment/upcoming', validate_token, appointmentController.find_all_upcoming_appointments_at_specific_duration)
router.get('/api/appointment/business/:business_id/node/:node_id/service/:service_id/slots', validate_token, appointmentController.find_available_slots)
router.get('/api/appointment/user/:user_id/slots', validate_token, appointmentController.find_available_slots_for_user)
router.get('/api/appointment/can-book', validate_token, appointmentController.can_customer_book_this_slot)
router.post('/api/appointment/book', validate_token, appointmentController.book_appointment)
router.put('/api/appointment/:appointment_id', validate_token, appointmentController.update_appointment)
router.get('/api/appointment/by-display-id/:display_id', validate_token, appointmentController.find_by_display_id)
router.get('/api/appointment/:appointment_id', validate_token, appointmentController.find_by_id)

router.get('/api/appointment/user/:user_id', validate_token, appointmentController.find_by_user)
router.get('/api/appointment/node/:node_id', validate_token, appointmentController.find_by_node)
router.get('/api/appointment/customer/:customer_id', validate_token, appointmentController.find_by_customer)
router.put('/api/appointment/cancel/:appointment_id', validate_token, appointmentController.cancel_appointment)
router.put('/api/appointment/complete/:appointment_id', validate_token, appointmentController.complete_appointment)
router.put('/api/appointment/confirm/:appointment_id', validate_token, appointmentController.confirm_appointment)


// ------------------------- Final Setup & 404 Routes ----------------------------
router.get('/', (_request, response) => { response.render("index") })
router.use("*", (_request, response) => { response.status(404).json({ success: false, message: "404: Page Not Found", data: null }) })

module.exports = router