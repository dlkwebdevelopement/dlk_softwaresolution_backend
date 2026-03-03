const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");

class Blog extends Model {
  static get tableName() {
    return "blogs";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  // Optional: JSON schema validation (recommended)
  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "slug", "short_description", "description", "image"],

      properties: {
        id: { type: "integer" },
        title: { type: "string", minLength: 1, maxLength: 255 },
        slug: { type: "string", minLength: 1, maxLength: 255 },
        short_description: { type: "string" },
        description: { type: "string" },
        image: { type: "string" },
        created_at: { type: "string" },
      },
    };
  }
}

module.exports = Blog;
