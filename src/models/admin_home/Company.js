const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");

class Company extends Model {
  static get tableName() {
    return "companies";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["photoUrl"],
      properties: {
        id: { type: "string" },
        photoUrl: { type: "string" },
      },
    };
  }
}

module.exports = Company;
