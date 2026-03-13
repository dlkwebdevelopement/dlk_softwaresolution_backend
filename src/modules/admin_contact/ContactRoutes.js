const express = require("express");
const router = express.Router();
const upload = require("../../multer/multerConfig");
const {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  markAsRead,
  replyToContact,
} = require("./ContactController");

router.post("/contact", createContact);
router.get("/contact", getAllContacts);
router.get("/contact/:id", getContactById);
router.delete("/contact/:id", deleteContact);
router.patch("/contact/:id/read", markAsRead);
router.post("/contact/reply", replyToContact);

module.exports = router;
