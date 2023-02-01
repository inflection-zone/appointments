module.exports = (sequelize, DataTypes) => {
    const Business_Node_Customer = sequelize.define(
        'business_node_customers',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_node_id: { type: DataTypes.UUID, allowNull: false },
            customer_id: { type: DataTypes.UUID, allowNull: false },
            sms_consent: { type: DataTypes.STRING, allowNull: false, defaultValue: 'NOT_REPLIED' },
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_node_customers'
        }
    )

    return Business_Node_Customer
}