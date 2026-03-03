const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");

class Contact extends Model {
  static get tableName() {
    return "contact_messages";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["first_name", "last_name", "email", "message", "accept_terms"],
      properties: {
        id: { type: "string" },

        first_name: { type: "string", minLength: 1, maxLength: 100 },
        last_name: { type: "string", minLength: 1, maxLength: 100 },

        email: { type: "string", format: "email", maxLength: 150 },

        phone: { type: ["string", "null"], maxLength: 10 },

        message: { type: "string", minLength: 2 },

        accept_terms: { type: "boolean" },
      },
    };
  }
}

module.exports = Contact;
