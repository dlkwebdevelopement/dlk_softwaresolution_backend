const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");


class Navbar extends Model {
  static get tableName() {
    return "navbar";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = Navbar;
