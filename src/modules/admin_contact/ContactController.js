const Contact = require("../../models/admin_contact/contact");
const transporter = require("../../utils/mailsender");

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

    // ⚡ Emit Socket Event
    const { getIO } = require("../../utils/socket");
    try {
      getIO().emit("newContact", {
        id: newContact._id,
        name: `${firstName} ${lastName}`,
        type: "Contact",
        time: new Date()
      });
    } catch (err) {
      console.error("Socket emission failed:", err.message);
    }

    // ✅ Send Automated Instant Reply
    try {
      const autoReplyOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Message Received - DLK Software Solutions",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3DB843; margin: 0;">DLK Software Solutions</h1>
              <p style="color: #666; font-size: 14px; margin-top: 5px;">Empowering Innovation</p>
            </div>
            
            <h2 style="color: #333; font-size: 20px;">Hello ${firstName} ${lastName},</h2>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for reaching out to us! We have received your message and our team is currently analyzing your request.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #888; text-transform: uppercase; font-size: 11px; font-weight: bold; letter-spacing: 1px;">Message Confirmation</p>
              <p style="margin-top: 10px; font-style: italic; color: #555;">"${message}"</p>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">Our team will contact you shortly with a detailed response.</p>
            
            <div style="margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">
              <p style="color: #333; font-weight: bold; margin-bottom: 5px;">Best Regards,</p>
              <p style="color: #3DB843; font-weight: bold; margin-top: 0;">The DLK Support Team</p>
            </div>
          </div>
        `,
      };

      const adminEmailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Contact Inquiry - ${firstName} ${lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2c3e50;">📩 New Contact Message</h2>
            <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Sender</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${message}</td></tr>
            </table>
          </div>
        `,
      };
      
      transporter.sendMail(autoReplyOptions).catch(err => console.error("Auto-reply mail error:", err));
      transporter.sendMail(adminEmailOptions).catch(err => console.error("Admin contact mail error:", err));
    } catch (mailError) {
      console.error("Mail setup error:", mailError);
    }

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
    const contacts = await Contact.find().sort({ createdAt: -1 });

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


// ✅ Mark Contact as Read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: contact,
    });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

// ✅ Reply to Contact via Email
exports.replyToContact = async (req, res) => {
  try {
    const { id, replyMessage } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: "Reply to your inquiry - DLK Software Solutions",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #3DB843;">Hello ${contact.first_name} ${contact.last_name},</h2>
          <p>Thank you for reaching out to DLK Software Solutions. Here is a reply to your message:</p>
          <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #3DB843; margin: 20px 0;">
            <p><strong>Your Message:</strong><br/>${contact.message}</p>
          </div>
          <p><strong>Our Reply:</strong></p>
          <p style="white-space: pre-line;">${replyMessage}</p>
          <p style="margin-top: 30px;">Best Regards,<br/><strong>Admin Team</strong><br/>DLK Software Solutions</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Update status to replied
    contact.isReply = true;
    contact.isRead = true;
    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Reply To Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reply email",
    });
  }
};
