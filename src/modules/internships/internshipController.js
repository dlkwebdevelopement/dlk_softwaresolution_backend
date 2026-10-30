const Internship = require("../../models/admin_home/Internship");
const Enquiry = require("../../models/admin_home/Enquiry");
const fs = require("fs");
const path = require("path");
const { getFullUrl } = require("../../utils/urlHelper");
const { getIO } = require("../../utils/socket");
const transporter = require("../../utils/mailsender");

// Helper to safely parse skills
const parseSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// GET ALL INTERNSHIPS
exports.getAllInternships = async (req, res) => {
  try {
    const { category, search, activeOnly } = req.query;
    const filter = {};

    if (activeOnly === "true") {
      filter.isActive = true;
    }

    if (category && category !== "All") {
      filter.category = new RegExp(category, "i");
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { skills: new RegExp(search, "i") },
      ];
    }

    const internships = await Internship.find(filter).sort({ order_index: 1, createdAt: -1 });

    const formatted = internships.map((item) => {
      const obj = item.toObject();
      return {
        ...obj,
        id: obj._id,
        syllabus_pdf_url: getFullUrl(obj.syllabus_pdf),
        image_url: getFullUrl(obj.image),
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("GET INTERNSHIPS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch internships", error: error.message });
  }
};

// GET SINGLE INTERNSHIP
exports.getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const internship = await Internship.findById(id);

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    const obj = internship.toObject();
    res.status(200).json({
      success: true,
      data: {
        ...obj,
        id: obj._id,
        syllabus_pdf_url: getFullUrl(obj.syllabus_pdf),
        image_url: getFullUrl(obj.image),
      },
    });
  } catch (error) {
    console.error("GET INTERNSHIP BY ID ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch internship", error: error.message });
  }
};

// CREATE INTERNSHIP
exports.createInternship = async (req, res) => {
  try {
    const { title, category, duration, mode, description, skills, isActive, order_index } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: "Title and Category are required" });
    }

    let syllabus_pdf = "";
    let image = "";

    if (req.files) {
      if (req.files.syllabus_pdf && req.files.syllabus_pdf.length > 0) {
        syllabus_pdf = req.files.syllabus_pdf[0].path.replace(/\\/g, "/");
      }
      if (req.files.image && req.files.image.length > 0) {
        image = req.files.image[0].path.replace(/\\/g, "/");
      }
    }

    if (!syllabus_pdf && req.body.syllabus_pdf) {
      syllabus_pdf = req.body.syllabus_pdf;
    }
    if (!image && req.body.image) {
      image = req.body.image;
    }

    const newInternship = new Internship({
      title: title.trim(),
      category: category.trim(),
      duration: duration || "3 Months",
      mode: mode || "Online / Offline Classroom",
      description: description || "",
      skills: parseSkills(skills),
      syllabus_pdf,
      image,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
      order_index: Number(order_index) || 0,
    });

    await newInternship.save();

    res.status(201).json({
      success: true,
      message: "Internship created successfully",
      data: newInternship,
    });
  } catch (error) {
    console.error("CREATE INTERNSHIP ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to create internship", error: error.message });
  }
};

// UPDATE INTERNSHIP
exports.updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Internship.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    const { title, category, duration, mode, description, skills, isActive, order_index } = req.body;

    if (title) existing.title = title.trim();
    if (category) existing.category = category.trim();
    if (duration !== undefined) existing.duration = duration;
    if (mode !== undefined) existing.mode = mode;
    if (description !== undefined) existing.description = description;
    if (skills !== undefined) existing.skills = parseSkills(skills);
    if (isActive !== undefined) existing.isActive = isActive === "true" || isActive === true;
    if (order_index !== undefined) existing.order_index = Number(order_index) || 0;

    if (req.files) {
      if (req.files.syllabus_pdf && req.files.syllabus_pdf.length > 0) {
        existing.syllabus_pdf = req.files.syllabus_pdf[0].path.replace(/\\/g, "/");
      }
      if (req.files.image && req.files.image.length > 0) {
        existing.image = req.files.image[0].path.replace(/\\/g, "/");
      }
    }

    if (req.body.syllabus_pdf && !req.files?.syllabus_pdf) {
      existing.syllabus_pdf = req.body.syllabus_pdf;
    }
    if (req.body.image && !req.files?.image) {
      existing.image = req.body.image;
    }

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Internship updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("UPDATE INTERNSHIP ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update internship", error: error.message });
  }
};

// DELETE INTERNSHIP
exports.deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Internship.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    res.status(200).json({
      success: true,
      message: "Internship deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INTERNSHIP ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete internship", error: error.message });
  }
};

// STUDENT REQUEST SYLLABUS: SEND PDF TO USER'S EMAIL & NOTIFY ADMIN
exports.requestSyllabus = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      mobile,
      college,
      degree,
      year,
      internshipId,
      internshipTitle,
      mode,
      location,
    } = req.body;

    const studentPhone = (mobile || phone || "").trim();
    const studentEmail = (email || "").trim().toLowerCase();
    const studentName = (name || "").trim();

    // 1. Mandatory validations: Email, Mobile, and Name
    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message: "Email address is mandatory to receive the syllabus.",
      });
    }

    if (!studentPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is mandatory.",
      });
    }

    if (!studentName) {
      return res.status(400).json({
        success: false,
        message: "Full name is mandatory.",
      });
    }

    // 2. Find internship to identify syllabus
    let internship = null;
    if (internshipId) {
      internship = await Internship.findById(internshipId);
    }
    if (!internship && internshipTitle) {
      internship = await Internship.findOne({
        title: new RegExp(`^${internshipTitle.trim()}$`, "i"),
      });
    }

    const courseName = internship ? internship.title : internshipTitle || "Internship Course";

    // 3. Save to Enquiry collection so lead is captured
    const newEnquiry = new Enquiry({
      name: studentName,
      email: studentEmail,
      mobile: studentPhone,
      course: `Internship: ${courseName}`,
      location: location || "Online",
      timeslot: `${degree || "Degree"} ${year ? `(${year})` : ""}`.trim() || "Regular",
      message: `Internship Syllabus Requested for "${courseName}". Student: ${studentName}, Mobile: ${studentPhone}, College: ${college || "N/A"}, Degree: ${degree || "N/A"}, Year: ${year || "N/A"}, Mode: ${mode || "Online"}`,
      inquiryType: "Internship Syllabus Request",
      isRead: false,
      isReply: false,
    });

    await newEnquiry.save();

    // 4. Trigger Socket.io real-time update to admin
    try {
      const io = getIO();
      if (io) {
        io.emit("new_enquiry", newEnquiry);
      }
    } catch (socketErr) {
      console.warn("Socket broadcast error:", socketErr.message);
    }

    // 5. Resolve PDF file on disk for email attachment
    let pdfRelPath = internship?.syllabus_pdf || "uploads/syllabus/1772515302787-239379321.pdf";
    if (pdfRelPath.includes("/uploads/")) {
      pdfRelPath = "uploads/" + pdfRelPath.split("/uploads/")[1];
    }
    const fullDiskPdfPath = path.join(__dirname, "../../../", pdfRelPath);

    const attachments = [];
    if (fs.existsSync(fullDiskPdfPath)) {
      const safeFilename = `${courseName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_")}_Syllabus.pdf`;
      attachments.push({
        filename: safeFilename,
        path: fullDiskPdfPath,
        contentType: "application/pdf",
      });
    }

    // 6. 📩 Send Syllabus PDF to Student's Email
    try {
      const userMailOptions = {
        from: `"DLK Software Solutions" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Your Syllabus PDF: ${courseName} - DLK Software Solutions`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; color: #1e293b;">
            <h2 style="color: #3DB843; margin-top: 0;">Hello ${studentName},</h2>
            <p>Thank you for requesting the official syllabus for <strong>${courseName}</strong>.</p>
            <p>Please find the complete syllabus PDF attached to this email.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #3DB843; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #0f172a;">Program: ${courseName}</p>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Mode: ${mode || "Online / Classroom"} | Contact: ${studentPhone}</p>
            </div>
            
            <p>Our senior technical counselor will be in touch with you shortly to answer any questions regarding batch schedules, project modules, and placement assistance.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="color: #64748b; font-size: 13px; margin: 0;">
              Best Regards,<br/>
              <strong>DLK Software Solutions</strong><br/>
              Chennai, Tamil Nadu
            </p>
          </div>
        `,
        attachments: attachments,
      };

      await transporter.sendMail(userMailOptions);
    } catch (userMailErr) {
      console.error("Failed to deliver syllabus to user:", userMailErr.message);
    }

    // 7. 📩 Send Notification Email to Admin (dlksoftwaresolutions@gmail.com)
    try {
      const adminMailOptions = {
        from: `"DLK Website Alerts" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `📌 Syllabus Download Request: ${courseName} - ${studentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px;">
            <h2 style="color: #064e3b; margin-top: 0;">📥 New Syllabus Request</h2>
            <p>A candidate has requested the syllabus for <strong>${courseName}</strong> and the PDF has been emailed to them.</p>
            
            <table style="border-collapse: collapse; width: 100%; margin-top: 15px; border: 1px solid #e2e8f0;">
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Requested Program</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: bold;">${courseName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Student Name</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${studentName}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email Address</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${studentEmail}">${studentEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Mobile / WhatsApp</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:${studentPhone}">${studentPhone}</a></td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">College / Institution</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${college || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Degree & Branch</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${degree || "N/A"}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Year of Study</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${year || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Preferred Mode</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${mode || "Online"}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Timestamp</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
        `,
      };

      await transporter.sendMail(adminMailOptions);
    } catch (adminMailErr) {
      console.error("Failed to notify admin of syllabus request:", adminMailErr.message);
    }

    return res.status(200).json({
      success: true,
      emailSent: true,
      message: `The syllabus PDF for ${courseName} has been emailed to ${studentEmail}.`,
    });
  } catch (error) {
    console.error("REQUEST SYLLABUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process syllabus request",
      error: error.message,
    });
  }
};
