const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Internship = require("../src/models/admin_home/Internship");

const sampleInternships = [
  {
    title: "Full Stack Web Development Internship (MERN Stack)",
    category: "Web Development",
    duration: "3 Months",
    mode: "Online / Offline Classroom",
    description: "Master frontend and backend development with MongoDB, Express.js, React, Node.js, and cloud deployment. Build 3 production-grade capstone applications with live industry mentorship.",
    skills: ["React.js", "Node.js", "Express.js", "MongoDB", "Redux", "Tailwind CSS", "REST APIs", "Git & GitHub"],
    syllabus_pdf: "uploads/syllabus/1772515302787-239379321.pdf",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    order_index: 1,
    isActive: true,
  },
  {
    title: "Artificial Intelligence & Machine Learning with Python Internship",
    category: "AI & Machine Learning",
    duration: "3 Months",
    mode: "Online / Hybrid",
    description: "Learn predictive modeling, deep learning, NLP, computer vision, and generative AI integration using Python, Scikit-learn, TensorFlow, and PyTorch.",
    skills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn", "Computer Vision"],
    syllabus_pdf: "uploads/syllabus/1772517636616-399336395.pdf",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
    order_index: 2,
    isActive: true,
  },
  {
    title: "Data Science & Business Analytics Internship",
    category: "Data Analytics",
    duration: "3 Months",
    mode: "Online / Offline Classroom",
    description: "Transform raw data into strategic business insights using Python, Advanced SQL, Power BI, Tableau dashboards, and statistical predictive modeling.",
    skills: ["Data Science", "Python", "SQL", "Power BI", "Tableau", "Data Visualization", "Statistics", "Excel Analytics"],
    syllabus_pdf: "uploads/syllabus/1772518011675-155648051.pdf",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    order_index: 3,
    isActive: true,
  },
  {
    title: "Cloud Computing & DevOps Engineering Internship",
    category: "Cloud & DevOps",
    duration: "3 Months",
    mode: "Online / Hybrid",
    description: "Gain hands-on expertise in AWS Cloud architecture, Docker containerization, Kubernetes orchestration, CI/CD automated pipelines, and Terraform infrastructure as code.",
    skills: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Terraform", "Jenkins", "DevOps"],
    syllabus_pdf: "uploads/syllabus/1772518286420-972270627.pdf",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    order_index: 4,
    isActive: true,
  },
  {
    title: "Cyber Security & Ethical Hacking Internship",
    category: "Cyber Security",
    duration: "3 Months",
    mode: "Online / Offline Classroom",
    description: "Hands-on vulnerability assessment, penetration testing, network defense, web application security (OWASP Top 10), and SOC incident analysis with real-time lab simulations.",
    skills: ["Ethical Hacking", "Network Security", "Kali Linux", "Wireshark", "Burp Suite", "OWASP Top 10", "Penetration Testing", "SOC Analysis"],
    syllabus_pdf: "uploads/syllabus/1772518643623-959711478.pdf",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    order_index: 5,
    isActive: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const existingCount = await Internship.countDocuments();
    console.log(`Current internships in DB: ${existingCount}`);

    if (existingCount === 0) {
      console.log("Seeding 5 sample internships...");
      await Internship.insertMany(sampleInternships);
      console.log("✅ 5 Sample internships successfully added!");
    } else {
      console.log("Checking if sample internships exist...");
      for (const item of sampleInternships) {
        const found = await Internship.findOne({ title: item.title });
        if (!found) {
          await Internship.create(item);
          console.log(`+ Added: ${item.title}`);
        } else {
          console.log(`✓ Exists: ${item.title}`);
        }
      }
    }

    const total = await Internship.countDocuments();
    console.log(`Total internships in DB now: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();

