const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

class CourseReview extends Model {
  static get tableName() {
    return "course_reviews";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = CourseReview;
