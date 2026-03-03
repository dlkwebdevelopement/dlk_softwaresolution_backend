const { Model } = require("objection");

const { v4: uuidv4 } = require("uuid");

class Testimonial extends Model {
  static get tableName() {
    return "testimonials";
  }

   $beforeInsert() {
    this.id = uuidv4();
  }
}

module.exports = Testimonial;