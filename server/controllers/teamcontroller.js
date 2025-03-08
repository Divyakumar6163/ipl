const fs = require("fs");
const PDFDocument = require("pdfkit");
const qr = require("qr-image");
const Match = require("../models/team");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
// Generate Invoice PDF

const generateInvoice = async (match) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
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
    const purchasePrice = 50;

    // Invoice Title
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("IPL FULLTOSS", { align: "center" });
    doc.moveDown(1);

    // Invoice Information
    doc.fontSize(12).font("Helvetica");
    doc.text(`Invoice ID: ${invoiceNumber}`);
    doc.text(`Invoice Date: ${invoiceDate}`);
    doc.text(`Purchase Price: Rs.${purchasePrice}`);
    doc.moveDown(2);

    // Match Details Section
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Match Details:", { underline: true });
    doc.moveDown(1);

    doc.font("Helvetica").fontSize(12);
    doc.text(
      `Match Date: ${new Date(match.matchDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    );
    doc.text(`Match Time: ${match.matchTime}`);

    doc.text(`Team 1: ${match.team1}`);
    doc.text(`Team 2: ${match.team2}`);
    doc.moveDown(2);

    // Player List Section
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Players:", { underline: true });
    doc.moveDown(1);

    doc.font("Helvetica").fontSize(12);
    match.players.forEach((player, index) => {
      doc.text(`${index + 1}. ${player}`);
    });
    doc.moveDown(1);

    // Generate QR Code with match details
    const qrCodeData = `${process.env.FRONTEND_LINK}/livescore/${invoiceNumber}`;

    const qrImage = qr.imageSync(qrCodeData, { type: "png" });
    doc.image(qrImage, doc.x + 170, doc.y, { width: 200, height: 200 });

    doc.moveDown(15);

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
    let { team1, team2, matchDate, matchTime, players } = req.body;

    if (!team1 || !team2 || !matchDate || !matchTime || players.length < 1) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dateParts = matchDate.split("-");
    matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

    if (isNaN(matchDate)) {
      return res.status(400).json({ message: "Invalid match date format" });
    }

    const match = new Match({ team1, team2, matchDate, matchTime, players });
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
    console.error("Error generating match invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Serve PDF files
const getInvoice = async (req, res) => {
  const filePath = `./invoices/${req.params.filename}`;
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { root: "." });
  } else {
    res.status(404).json({ message: "Invoice not found" });
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
