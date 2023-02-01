module.exports = (sequelize, DataTypes) => {
    const Business = sequelize.define(
        'businesses',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            external_id: { type: DataTypes.STRING, allowNull: true },
            
            name: { type: DataTypes.STRING, allowNull: false },

            mobile: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false },

            about_us: { type: DataTypes.TEXT, allowNull: true },
            logo: { type: DataTypes.TEXT, allowNull: true },
            display_picture: { type: DataTypes.TEXT, allowNull: true },
            overall_rating: { type: DataTypes.FLOAT, allowNull: true },

            address: { type: DataTypes.TEXT, allowNull: true },
            api_key: { type: DataTypes.STRING, allowNull: false },

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
            tableName: 'businesses'
        }
    )

    return Business
}