module.exports = (sequelize, DataTypes) => {
    const Business_Node = sequelize.define(
        'business_nodes',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_id: { type: DataTypes.UUID, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },

            mobile: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false },

            display_picture: { type: DataTypes.TEXT, allowNull: true },
            address: { type: DataTypes.TEXT, allowNull: true },

            longitude: { type: DataTypes.STRING, allowNull: true },
            lattitude: { type: DataTypes.STRING, allowNull: true },
            overall_rating: { type: DataTypes.FLOAT, allowNull: true },

            time_zone: { type: DataTypes.STRING, allowNull: false, defaultValue: '+05:30' },

            allow_walkin_appointments: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            allow_future_booking_for: { type: DataTypes.STRING, allowNull: false, defaultValue: '30d' },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_nodes'
        }
    )

    return Business_Node
}