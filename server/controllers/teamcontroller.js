const PDFDocument = require("pdfkit");
const qr = require("qr-image");
const Match = require("../models/team");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

// Generate Invoice PDF and stream directly to the response
const generateInvoice = async (match, res) => {
  return new Promise((resolve, reject) => {
    try {
      // Create the PDF document in memory
      const doc = new PDFDocument({ margin: 50, size: "A4" });

      // Set the headers to indicate a PDF attachment
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Match_Invoice_${match._id}.pdf`
      );

      // Pipe the document directly to the response
      doc.pipe(res);

      const invoiceNumber = match._id.toString();
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
      const purchasePrice = match.price;

      // Start at a vertical position (for centering if needed)
      // const startY = 100;
      // doc.y = startY;

      // // Invoice Title
      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("IPL FANTASY", { align: "center" });
      doc.moveDown(1);

      // Invoice Information
      doc.font("Helvetica").fontSize(12);
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
      const qrSize = 250; // Doubling the original size of 100

      // Calculate the horizontal position to center the QR code
      const qrX = (pageWidth - qrSize) / 2;

      // Add the QR code image to the PDF
      doc.image(qrImage, qrX, doc.y, { width: qrSize, height: qrSize });

      // Move down the document to provide space after the QR code
      doc.moveDown(19);

      // Footer
      doc.text(`Contact Us: ${process.env.CONTACT_NUMBER}`, {
        align: "center",
      });
      doc.moveDown(1);
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text("Thank you for using our service!", { align: "center" });

      // Finalize PDF file
      doc.end();

      // Resolve once the document is finished streaming
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Create Match & Generate PDF (streamed)
const createMatch = async (req, res) => {
  try {
    let { team1, team2, matchDate, matchTime, players, price } = req.body;

    // Validate required fields
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

    // Parse the match date (assumed format: "DD-MM-YYYY")
    const dateParts = matchDate.split("-");
    matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    if (isNaN(matchDate)) {
      return res.status(400).json({ message: "Invalid match date format" });
    }

    const match = new Match({
      team1,
      team2,
      matchDate,
      matchTime,
      price,
      players,
    });
    await match.save();

    // Log headers for debugging
    console.log("Sending Response Headers:", {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Match_Invoice_${match._id}.pdf`,
      "Match-ID": match._id.toString(),
    });

    // Set response headers and stream PDF directly
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Match_Invoice_${match._id}.pdf`,
      "Match-ID": match._id.toString(),
    });

    // Generate and stream the PDF directly without saving to disk
    await generateInvoice(match, res);
  } catch (error) {
    console.error("Error generating match Receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Serve PDF files (for local testing; not used on Vercel)
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
    if (!teamID || teamID.length === 0) {
      return res.status(400).json({ message: "No team ID provided" });
    }
    const players = await Match.find({ _id: { $in: teamID } });
    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createMatch, getInvoice, getPlayers };
