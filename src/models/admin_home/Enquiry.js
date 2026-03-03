const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");

class Enquiry extends Model {
  static get tableName() {
    return "enquiries";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "email", "mobile", "course", "location", "timeslot"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        mobile: { type: "string" },
        course: { type: "string" },
        location: { type: "string" },
        timeslot: { type: "string" },
        created_at: { type: "string", format: "date-time" },
      },
    };
  }
}

module.exports = Enquiry;
