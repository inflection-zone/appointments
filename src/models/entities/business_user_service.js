module.exports = (sequelize, DataTypes) => {
    const Business_User_Service = sequelize.define(
        'business_user_services',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_user_id: { type: DataTypes.UUID, allowNull: false },
            business_service_id: { type: DataTypes.UUID, allowNull: false },
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_user_services'
        }
    )

    return Business_User_Service
}