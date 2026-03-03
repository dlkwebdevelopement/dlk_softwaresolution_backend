const { Model } = require("objection");

const { v4: uuidv4 } = require("uuid");

const Navbar = require("./Navbar");

class Subcategory extends Model {
  static get tableName() {
    return "subcategories";
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
          from: "subcategories.category_id",
          to: "navbar.id",
        },
      },
    };
  }
}

module.exports = Subcategory;
