const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

class CourseWhoShouldEnroll extends Model {
  static get tableName() {
    return "course_who_should_enroll";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = CourseWhoShouldEnroll;
