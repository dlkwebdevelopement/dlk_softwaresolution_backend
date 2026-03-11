const Contact = require("../../models/admin_contact/contact");

// ✅ Create Contact Message
exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message, acceptTerms } =
      req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !message || !acceptTerms) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (acceptTerms !== true) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions",
      });
    }

    // Insert using Mongoose
    const newContact = await Contact.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      message,
      accept_terms: acceptTerms,
    });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Contact Create Error:", error);

    // ✅ Mongoose Model Validation Error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    // ✅ Database or other server errors
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ✅ Get All Contact Messages (Admin Side)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Get Contacts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
    });
  }
};

// ✅ Get Single Contact By ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get Contact By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message",
    });
  }
};

// ✅ Delete Contact (Optional - Admin)
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
    });
  }
};

