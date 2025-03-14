const fs = require("fs");
const PDFDocument = require("pdfkit");
const qr = require("qr-image");
const Match = require("../models/team");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
// Generate Invoice PDF

const generateInvoice = async (match) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" }); // A4 for standard size
    const fileName = `invoice_${match._id}.pdf`;
    const filePath = `./invoices/${fileName}`;

    // Ensure directory exists
    if (!fs.existsSync("./invoices")) {
      fs.mkdirSync("./invoices");
    }

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const invoiceNumber = match._id.toString();
    const invoiceDate = new Date().toLocaleString();
    const purchasePrice = match.price;

    // Approximate vertical centering - move to start point
    const startY = 100; // Adjust this value as needed for better centering
    doc.y = startY;

    // Invoice Title
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("IPL FULLTOSS", { align: "center" });
    doc.moveDown(1);

    // Invoice Information
    doc.fontSize(12).font("Helvetica");
    doc.text(`Receipt ID: ${invoiceNumber}`, { align: "center" });
    doc.text(`Receipt Date: ${invoiceDate}`, { align: "center" });
    doc.text(`Purchase Price: Rs.${purchasePrice}`, { align: "center" });
    doc.moveDown(0.5);

    // Match Details Section
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Match Details", { align: "center" });
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(12);
    doc.text(` ${match.team1} vs ${match.team2}`, { align: "center" });
    doc.text(
      `${new Date(match.matchDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })} | ${match.matchTime}`,
      { align: "center" }
    );
    doc.moveDown(2);

    // Player List Section
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Players", { align: "center" });
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(12);
    match.players.forEach((player, index) => {
      doc.text(`${index + 1}. ${player}`, { align: "center" });
    });
    doc.moveDown(0.5);

    // Generate QR Code with match details
    const qrCodeData = `${process.env.FRONTEND_LINK}/livescore/${invoiceNumber}`;
    const qrImage = qr.imageSync(qrCodeData, { type: "png" });

    // Center QR Code
    const pageWidth = doc.page.width;
    const qrSize = 100;
    const qrX = (pageWidth - qrSize) / 2;
    doc.image(qrImage, qrX, doc.y, { width: qrSize, height: qrSize });
    doc.moveDown(8); // Adjust as needed based on QR code height

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text("Thank you for using our service!", { align: "center" });

    // Finish PDF
    doc.end();

    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
};

// Create Match & Generate PDF
const createMatch = async (req, res) => {
  try {
    let { team1, team2, matchDate, matchTime, players, price } = req.body;

    if (
      !team1 ||
      !team2 ||
      !matchDate ||
      !matchTime ||
      !price ||
      players.length < 1
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dateParts = matchDate.split("-");
    matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

    if (isNaN(matchDate)) {
      return res.status(400).json({ message: "Invalid match date format" });
    }
    console.log(price);
    const match = new Match({
      team1,
      team2,
      matchDate,
      matchTime,
      price,
      players,
    });
    await match.save();

    const pdfPath = await generateInvoice(match);

    // ✅ Log response headers before sending response
    console.log("Sending Response Headers:", {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Match_Invoice_${match._id}.pdf`,
      "Match-ID": match._id.toString(),
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Match_Invoice_${match._id}.pdf`,
      "Match-ID": match._id.toString(), // ✅ Ensure Match-ID is set
    });

    // ✅ Send the PDF file as a stream
    const pdfStream = fs.createReadStream(pdfPath);
    pdfStream.pipe(res);
  } catch (error) {
    console.error("Error generating match Receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Serve PDF files
const getInvoice = async (req, res) => {
  const filePath = `./invoices/${req.params.filename}`;
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { root: "." });
  } else {
    res.status(404).json({ message: "Receipt not found" });
  }
};

const getPlayers = async (req, res) => {
  try {
    const { teamID } = req.params;
    console.log(teamID);
    if (!teamID || teamID.length === 0) {
      return res.status(400).json({ message: "No team ID provided" });
    }

    const players = await Match.find({ _id: { $in: teamID } });
    console.log(players);
    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { createMatch, getInvoice, getPlayers };
