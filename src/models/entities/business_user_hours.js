module.exports = (sequelize, DataTypes) => {
    const Business_User_Hours = sequelize.define(
        'business_user_hours',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_user_id: { type: DataTypes.UUID, allowNull: false },
            
            type: { type: DataTypes.STRING, allowNull: false },
            day: { type: DataTypes.INTEGER, allowNull: false },
            date: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
            is_open: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            message: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            start_time: { type: DataTypes.TIME, allowNull: false, defaultValue: '10:00:00' },
            end_time: { type: DataTypes.TIME, allowNull: false, defaultValue: '21:00:00' },
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_user_hours'
        }
    )

    return Business_User_Hours
}