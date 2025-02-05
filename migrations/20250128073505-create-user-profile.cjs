'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
      await queryInterface.createTable('UserProfiles', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        //fk
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', 
            key: 'id',
          },
          onDelete: 'CASCADE', // it .....Delete userprofile when User is deleted
        },
        profileImage: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('UserProfiles');
  }
};
