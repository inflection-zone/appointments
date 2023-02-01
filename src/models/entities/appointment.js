module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define(
        'appointments',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            display_id: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },

            business_node_id: { type: DataTypes.UUID, allowNull: false },
            customer_id: { type: DataTypes.UUID, allowNull: false },
            business_user_id: { type: DataTypes.UUID, allowNull: false },
            business_service_id: { type: DataTypes.UUID, allowNull: false },

            type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'IN-PERSON' },
            note: { type: DataTypes.TEXT, allowNull: true },
            
            start_time: { type: DataTypes.DATE, allowNull: true },
            end_time: { type: DataTypes.DATE, allowNull: true },

            status: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
            status_code: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },

            fees: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            tax: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            tip: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            discount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            coupon_code: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },

            is_paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            transaction_id: { type: DataTypes.UUID, allowNull: true },

            is_confirmed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            confirmed_on: { type: DataTypes.DATE, allowNull: true },

            is_cancelled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            cancelled_on: { type: DataTypes.DATE, allowNull: true },

            is_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            completed_on: { type: DataTypes.DATE, allowNull: true },

            is_rescheduled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            rescheduled_on: { type: DataTypes.DATE, allowNull: true },
            rescheduled_appointment_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: true },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'appointments'
        }
    )

    return Appointment
}