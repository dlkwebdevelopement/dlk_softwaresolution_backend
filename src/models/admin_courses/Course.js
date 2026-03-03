const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

class Course extends Model {
  static get tableName() {
    return "course";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get relationMappings() {
    const CourseWhoShouldEnroll = require("./CourseWhoShouldEnroll");
    const CourseLearningPoint = require("./CourseLearningPoint");
    const CourseCurriculum = require("./CourseCurriculum");
    const CourseReview = require("./CourseReview");

    return {
      whoShouldEnroll: {
        relation: Model.HasManyRelation,
        modelClass: CourseWhoShouldEnroll,
        join: {
          from: "course.id",
          to: "course_who_should_enroll.course_id",
        },
      },

      learningPoints: {
        relation: Model.HasManyRelation,
        modelClass: CourseLearningPoint,
        join: {
          from: "course.id",
          to: "course_learning_points.course_id",
        },
      },

      curriculum: {
        relation: Model.HasManyRelation,
        modelClass: CourseCurriculum,
        join: {
          from: "course.id",
          to: "course_curriculum.course_id",
        },
      },

      reviews: {
        relation: Model.HasManyRelation,
        modelClass: CourseReview,
        join: {
          from: "course.id",
          to: "course_reviews.course_id",
        },
      },
    };
  }
}

module.exports = Course;
