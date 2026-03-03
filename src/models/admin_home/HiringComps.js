const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");


class HiringComps extends Model {
  static get tableName() {
    return "hiringComps";
  }

  $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = HiringComps;
