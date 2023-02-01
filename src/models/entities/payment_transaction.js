module.exports = (sequelize, DataTypes) => {
    const Payment_Transaction = sequelize.define(
        'payment_transactions',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            appointment_id: { type: DataTypes.UUID, allowNull: true },
            business_node_id: { type: DataTypes.UUID, allowNull: false },
            customer_id: { type: DataTypes.UUID, allowNull: false },

            external_id: { type: DataTypes.STRING, allowNull: true },

            total_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
            currency: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },

            status: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            is_complete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            
            initiated_on: { type: DataTypes.DATE, allowNull: true },
            completed_on: { type: DataTypes.DATE, allowNull: true },

            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'payment_transactions'
        }
    )

    return Payment_Transaction
}