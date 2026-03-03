const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");

class Banner extends Model {
  static get tableName() {
    return "banners";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "highlight", "subtitle", "photoUrl"],
      properties: {
        id: { type: "string", format: "uuid" },

        title: { type: "string" },
        highlight: { type: "string" },
        subtitle: { type: "string" },
        tagline: { type: ["string", "null"] },
        description: { type: ["string", "null"] },
        button: { type: ["string", "null"] },

        photoUrl: { type: "string" },
      },
    };
  }
}

module.exports = Banner;
