const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

class CourseCurriculum extends Model {
  static get tableName() {
    return "course_curriculum";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = CourseCurriculum;
