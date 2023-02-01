module.exports = (sequelize, DataTypes) => {
    const Business_User = sequelize.define(
        'business_users',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_node_id: { type: DataTypes.UUID, allowNull: false },

            first_name: { type: DataTypes.STRING, allowNull: false },
            last_name: { type: DataTypes.STRING, allowNull: false },
            prefix: { type: DataTypes.STRING, allowNull: false },

            mobile: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: true },

            display_picture: { type: DataTypes.TEXT, allowNull: true },
            about_me: { type: DataTypes.TEXT, allowNull: true },
            qualification: { type: DataTypes.TEXT, allowNull: true },
            experience: { type: DataTypes.STRING, allowNull: true },
            overall_rating: { type: DataTypes.FLOAT, allowNull: true },

            dob: { type: DataTypes.DATE, allowNull: true },
            gender: { type: DataTypes.STRING, allowNull: true },

            is_available_for_emergency: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },

            facebook: { type: DataTypes.STRING, allowNull: true },
            linkedin: { type: DataTypes.STRING, allowNull: true },
            twitter: { type: DataTypes.STRING, allowNull: true },
            instagram: { type: DataTypes.STRING, allowNull: true },
            yelp: { type: DataTypes.STRING, allowNull: true },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_users'
        }
    )

    return Business_User
}