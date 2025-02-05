import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user', 
    },
    permanentAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    secondaryAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    citizenshipNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetOtp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetOtpExpire: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true, 
    }, 
}, {
    defaultScope: {
        attributes: { exclude: ['password'] } //...here exclude password here by default
    },
    scopes: {
        withPassword: { attributes: {} }, // Scope to include password if needed (i used this in login)
    }
       
});



// Export  User model for to be used in UserProfile
export { User };
