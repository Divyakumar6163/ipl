const Contest = require("../models/contest");
const PDFDocument = require("pdfkit");
const qr = require("qr-image");
const path = require("path"); // Import path module
const fs = require("fs"); // Import fs module
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const ContestSubmission = require("../models/makecontest");
const generateInvoice = async (match, res) => {
  console.log("id: " + match);
  return new Promise((resolve, reject) => {
    try {
      // Create the PDF document in memory
      const doc = new PDFDocument({ margin: 50, size: "A4" });

      // Set the headers to indicate a PDF attachment
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Contest_Invoice_${match._id}.pdf`
      );

      // Pipe the document directly to the response
      doc.pipe(res);

      const invoiceNumber = match._id;
      const options = {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      const now = new Date();
      const invoiceDate = now.toLocaleString("en-IN", options);
      // const purchasePrice = match.price;

      // Start at a vertical position (for centering if needed)
      // const startY = 100;
      // doc.y = startY;

      // // Invoice Title
      const imagePath = path.join(__dirname, "../public/companyLogo.jpg");
      console.log("Image Path:", imagePath);

      if (fs.existsSync(imagePath)) {
        const pageWidth = doc.page.width;
        const imageWidth = 150;
        const imageX = (pageWidth - imageWidth) / 2; // Center the image

        doc.image(imagePath, imageX, 50, { width: imageWidth });
      } else {
        console.error("Image not found:", imagePath);
      }

      // ✅ Move down after image
      doc.moveDown(7);

      // doc
      //   .font("Helvetica-Bold")
      //   .fontSize(22)
      //   .text("IPL FANTASY", { align: "center" });
      // doc.moveDown(1);

      // Invoice Information
      doc.font("Helvetica").fontSize(18);
      doc.text(`Receipt ID: ${match.contest_id}`, { align: "center" });
      // doc.text(`Purchase Price: Rs.${purchasePrice}`, { align: "center" });
      doc.moveDown(0.5);

      // Match Details Section
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Match Details", { align: "center" });
      doc.moveDown(0.5);

      doc.font("Helvetica").fontSize(12);
      doc.text(`${match.team1} vs ${match.team2}`, { align: "center" });
      doc.text(
        `${new Date(match.matchDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} | ${match.matchTime}`,
        { align: "center" }
      );
      doc.moveDown(2);

      // Question List Section
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Your Contest", { align: "center" });
      doc.moveDown(0.5);

      doc.font("Helvetica").fontSize(12);
      match.selectedQuestions.forEach((question, index) => {
        doc.text(`${index + 1}. ${question.text}`, { align: "center" });
        doc.text(
          `   - Answer: ${question.option.toUpperCase()} (${
            question.points
          } pts)`,
          { align: "center" }
        );
        doc.moveDown(0.5);
      });
      doc.moveDown(0.5);

      // Generate QR Code with match details
      const qrCodeData = `${process.env.FRONTEND_LINK}/contestscore/${invoiceNumber}`;
      const qrImage = qr.imageSync(qrCodeData, { type: "png" });

      // Center QR Code
      const pageWidth = doc.page.width;
      const qrSize = 250; // Doubling the original size of 100

      // Calculate the horizontal position to center the QR code
      const qrX = (pageWidth - qrSize) / 2;

      // Add the QR code image to the PDF
      doc.image(qrImage, qrX, doc.y, { width: qrSize, height: qrSize });

      // Move down the document to provide space after the QR code
      doc.moveDown(19);

      // Footer
      doc.text(`WhatsApp Us: ${process.env.CONTACT_NUMBER}`, {
        align: "center",
      });
      doc.moveDown(1);
      doc
        .font("Helvetica-Oblique")
        .fontSize(12)
        .text(`Receipt Date: ${invoiceDate}`, { align: "center" });
      // doc
      //   .font("Helvetica-Oblique")
      //   .fontSize(10)
      //   .text("Thank you for using our service!", { align: "center" });

      // Finalize PDF file
      doc.end();

      // Resolve once the document is finished streaming
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
const getcontest = async (req, res) => {
  try {
    const { matchTime, matchDate, team1, team2 } = req.body;

    // ✅ Validate Input
    if (!matchTime || !matchDate || !team1 || !team2) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Find Match in Database
    const match = await Contest.findOne({ matchTime, matchDate, team1, team2 });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // ✅ Send Only Questions as Response
    return res.json({ questions: match.questions });
  } catch (error) {
    console.error("Error fetching contest questions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const generateInvoiceId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters =
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)];
  const randomNumbers = Math.floor(100 + Math.random() * 900); // 3-digit random number (100-999)
  return `${randomLetters}${randomNumbers}`;
};
const makecontest = async (req, res) => {
  try {
    const { matchDate, matchTime, team1, team2, selectedQuestions } = req.body;
    console.log("Request Body:", req.body);
    // ✅ Validate Input
    if (
      !matchDate ||
      !matchTime ||
      !team1 ||
      !team2 ||
      selectedQuestions.length !== 3
    ) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // ✅ Save Data in MongoDB
    const contest_id = generateInvoiceId();
    console.log(contest_id);
    const newSubmission = new ContestSubmission({
      contest_id,
      matchDate,
      matchTime,
      team1,
      team2,
      selectedQuestions,
    });

    await newSubmission.save();

    console.log("Sending Response Headers:", {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Contest_Invoice_${newSubmission._id}.pdf`,
      "Contest-ID": newSubmission._id.toString(),
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Contest_Invoice_${newSubmission._id}.pdf`,
      "Contest-ID": newSubmission._id.toString(), // Ensure this line is present
    });

    // Generate and stream the PDF directly without saving to disk
    await generateInvoice(newSubmission, res);
    // return res.status(201).json({
    //   message: "Contest saved successfully",
    //   contest: newSubmission,
    // });
  } catch (error) {
    console.error("Error saving contest:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getcontest, makecontest };
