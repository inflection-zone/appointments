module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define(
        'customers',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            first_name: { type: DataTypes.STRING, allowNull: true },
            last_name: { type: DataTypes.STRING, allowNull: true },
            prefix: { type: DataTypes.STRING, allowNull: true },

            mobile: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: true },

            dob: { type: DataTypes.DATE, allowNull: true },
            gender: { type: DataTypes.STRING, allowNull: true },

            display_picture: { type: DataTypes.TEXT, allowNull: true },
            address: { type: DataTypes.TEXT, allowNull: true },

            in_app_user: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'customers'
        }
    )

    return Customer
}