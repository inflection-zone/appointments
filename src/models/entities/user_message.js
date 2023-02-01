module.exports = (sequelize, DataTypes) => {
    const User_Message = sequelize.define(
        'user_messages',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_node_id: { type: DataTypes.UUID, allowNull: false },
            customer_id: { type: DataTypes.UUID, allowNull: false },
            
            body: { type: DataTypes.TEXT, allowNull: true },
            type: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            type_id: { type: DataTypes.INTEGER, allowNull: false },
            message_id: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            error: { type: DataTypes.TEXT, allowNull: true },

            is_sent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            sent_on: { type: DataTypes.DATE, allowNull: true },

            is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            deleted_on: { type: DataTypes.DATE, allowNull: true },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'user_messages'
        }
    )

    return User_Message
}