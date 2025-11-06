import type { Migration } from "sequelize-cli";

const migration: Migration = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn("auth_token", "expires_at", {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      });

      await queryInterface.addIndex("auth_token", ["expires_at"], {
        name: "auth_token_expires_at",
        unique: false,
        transaction,
      });

      await queryInterface.addIndex("auth_token", ["token"], {
        name: "auth_token_token",
        unique: true,
        transaction,
      });

      await queryInterface.addIndex("user", ["username"], {
        name: "user_username",
        unique: true,
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeIndex("auth_token", "auth_token_expires_at");
      await queryInterface.removeColumn("auth_token", "expires_at");
      await queryInterface.removeIndex("auth_token", "auth_token_token");
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};

export default migration;
