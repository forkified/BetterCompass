"use strict"

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "compact", {
      type: Sequelize.ENUM(["enabled", "lowRes", "disabled", "nagPending"]),
      defaultValue: "nagPending"
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "compact")
  }
}
