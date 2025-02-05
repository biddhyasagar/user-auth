import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.js';

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',  
            key: 'id',
        },
        onDelete: 'CASCADE',  
    },
});

// UserProfile.belongsTo(User, {
//     foreignKey: 'userId',
//     as: 'user',
// });

User.hasOne(UserProfile, {
    foreignKey: 'userId',
    as: 'profile',
})

// Export UserProfile to be used by other files
export { UserProfile };
