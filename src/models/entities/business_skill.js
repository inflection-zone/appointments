module.exports = (sequelize, DataTypes) => {
    const Business_Skill = sequelize.define(
        'business_skills',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_node_id: { type: DataTypes.UUID, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            display_picture: { type: DataTypes.TEXT, allowNull: true },
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_skills'
        }
    )

    return Business_Skill
}