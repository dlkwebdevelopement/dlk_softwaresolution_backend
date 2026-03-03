const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

class CourseLearningPoint extends Model {
  static get tableName() {
    return "course_learning_points";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = CourseLearningPoint;
