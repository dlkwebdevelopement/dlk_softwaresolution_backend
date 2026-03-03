const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");
const Navbar = require("./Navbar");

class Registration extends Model {
  static get tableName() {
    return "registrations";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get relationMappings() {
    return {
      course: {
        relation: Model.BelongsToOneRelation,
        modelClass: Navbar,
        join: {
          from: "registrations.courseId",
          to: "navbar.id",
        },
      },
    };
  }
}

module.exports = Registration;
