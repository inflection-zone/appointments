module.exports = (sequelize, DataTypes) => {
    const Appointment_Status = sequelize.define(
        'appointment_statuses',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_node_id: { type: DataTypes.UUID, allowNull: false },
            status: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            status_code: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            status_color: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            sequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

            send_notification: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notification_text: { type: DataTypes.TEXT, allowNull: true },

            send_sms: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            sms_text: { type: DataTypes.TEXT, allowNull: true },

            is_dashboard_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            is_completed_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            is_confirmed_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            is_cancellation_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            is_walkin_entry_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'appointment_statuses'
        }
    )

    return Appointment_Status
}