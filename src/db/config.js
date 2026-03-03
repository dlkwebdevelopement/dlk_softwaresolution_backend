const { Model } = require("objection");
const knex = require("knex");
const config = require("../../knexfile").development; 
const db = knex(config); 

Model.knex(db);

module.exports = db;


