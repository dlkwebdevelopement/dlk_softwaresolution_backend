require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // Check if admin already exists
  const existing = await knex('admins').where({ username }).first();
  if (existing) {
    console.log(`Admin user "${username}" already exists.`);
    return;
  }

  

  // Insert new admin
  await knex('admins').insert({
    id: uuidv4(),
    username,
    password,
  });

  console.log(`✅ Admin user "${username}" created successfully!`);
};
