const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");

class Question extends Model {
  static get tableName() {
    return "questions";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["question"],
      properties: {
        id: { type: "string" },
        question: { type: "string" },
      },
    };
  }

  static get relationMappings() {
    const Answer = require("./Question").Answer;
    return {
      answers: {
        relation: Model.HasManyRelation,
        modelClass: Answer,
        join: {
          from: "questions.id",
          to: "answers.question_id",
        },
      },
    };
  }
}

class Answer extends Model {
  static get tableName() {
    return "answers";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["answer", "question_id"],
      properties: {
        id: { type: "string" },
        answer: { type: "string" },
        question_id: { type: "string" },
      },
    };
  }
}

module.exports = { Question, Answer };
