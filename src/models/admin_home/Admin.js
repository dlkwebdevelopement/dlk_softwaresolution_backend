const { v4: uuidv4 } = require("uuid");
const {Model} = require("objection");

class Admin extends Model {
  static get tableName() {
    return "admins";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "password"],
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
      },
    };
  }
}

module.exports = Admin;
