import type { Migration } from "sequelize-cli";

const migration: Migration = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user", "password", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user", "password");
  },
};

export default migration;
