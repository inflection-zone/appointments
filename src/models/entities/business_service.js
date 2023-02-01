module.exports = (sequelize, DataTypes) => {
    const Business_Service = sequelize.define(
        'business_services',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_node_id: { type: DataTypes.UUID, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },

            service_duration: { type: DataTypes.STRING, allowNull: false, defaultValue: '30m' },

            fees: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            is_taxable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            tax_rate: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            payment_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            payment_percent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },

            prior_booking_window: { type: DataTypes.STRING, allowNull: false, defaultValue: '1h' },

            send_reminder: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            reminder_window: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            reminder_type: { type: DataTypes.STRING, allowNull: null, defaultValue: null },

            allow_cancellation: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            cancellation_window: { type: DataTypes.STRING, allowNull: false, defaultValue: '1h' },
            cancellation_charges: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },

            enable_loyalty: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            display_service_picture: { type: DataTypes.TEXT, allowNull: true },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_services'
        }
    )

    return Business_Service
}