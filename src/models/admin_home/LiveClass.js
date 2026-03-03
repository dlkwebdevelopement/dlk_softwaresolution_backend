const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

const Navbar = require("./Navbar");

class LiveClass extends Model {
  static get tableName() {
    return "liveClasses";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get relationMappings() {
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Navbar,
        join: {
          from: "liveClasses.courseId",
          to: "navbar.id",
        },
      },
    };
  }
}

module.exports = LiveClass;
