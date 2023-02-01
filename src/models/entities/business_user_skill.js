module.exports = (sequelize, DataTypes) => {
    const Business_User_Skill = sequelize.define(
        'business_user_skills',
        {
            id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },

            business_user_id: { type: DataTypes.UUID, allowNull: false },
            business_skill_id: { type: DataTypes.UUID, allowNull: false },
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,
            tableName: 'business_user_skills'
        }
    )

    return Business_User_Skill
}