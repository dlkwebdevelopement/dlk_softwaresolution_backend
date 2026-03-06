const { Model } = require("objection");
const knex = require("knex");
 
const environment = process.env.NODE_ENV || "development";
const config = require("../../knexfile")[environment];
 
const db = knex(config);
 
Model.knex(db);
 
module.exports = db;