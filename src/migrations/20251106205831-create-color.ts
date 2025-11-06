import type { Migration } from "sequelize-cli";

const migration: Migration = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("color", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(32),
      },
      key: {
        allowNull: false,
        type: Sequelize.STRING(8),
      },
      r: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      g: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      b: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      hex: {
        allowNull: false,
        type: Sequelize.STRING(6),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("color");
  },
};

export default migration;
