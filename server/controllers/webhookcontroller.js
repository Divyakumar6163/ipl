const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
// const Verification = require("../models/Verification"); // MongoDB model
const twilio = require("twilio");

const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const client = twilio(accountSid, authToken);

// OpenAI Configuration
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// WhatsApp Webhook Controller
const webhook = async (req, res) => {
  try {
    const from = req.body.From;
    const mediaUrl = req.body.MediaUrl0;
    const incomingMessage = req.body.Body.trim().toLowerCase();

    // If user replies with 'yes' or 'no' for verification
    if (incomingMessage === "yes" || incomingMessage === "no") {
      //   const latestRecord = await Verification.findOne({ from }).sort({
      //     createdAt: -1,
      //   });
      //   if (!latestRecord) {
      //     await sendMessage(from, "No recent invoice found for verification.");
      //     return res.sendStatus(200);
      //   }

      if (incomingMessage === "yes") {
        // latestRecord.verified = true;
        // await latestRecord.save();
        await sendMessage(
          from,
          "Thank you! Your invoice details have been verified."
        );
      } else {
        await sendMessage(
          from,
          "Sorry! Please resend a clearer invoice image."
        );
      }
      return res.sendStatus(200);
    }

    // If it's an image
    if (mediaUrl) {
      const imageBuffer = await downloadImage(mediaUrl);
      const extractedData = await processImageWithOpenAI(imageBuffer);

      if (!extractedData) {
        await sendMessage(
          from,
          "Couldn't extract details properly. Please try with a clearer image."
        );
        return res.sendStatus(200);
      }

      // Save data in MongoDB for later verification
      //   const savedRecord = await Verification.create({
      //     from,
      //     data: extractedData,
      //     verified: false,
      //   });

      // Send extracted data to user for confirmation
      const message =
        `Here are the extracted details:\n\n` +
        `🏏 Team Name: ${extractedData.teamName}\n` +
        `📅 Match Date: ${extractedData.matchDate}\n` +
        `⏰ Match Time: ${extractedData.matchTime}\n` +
        `🧾 Invoice ID: ${extractedData.invoiceId}\n\n` +
        `Reply with 'Yes' if correct, 'No' if incorrect.`;

      await sendMessage(from, message);
      return res.sendStatus(200);
    } else {
      await sendMessage(from, "Please send an image of the invoice.");
      return res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error in WhatsApp Webhook:", error.message);
    res.sendStatus(500);
  }
};

// Function to download image
const downloadImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

// Function to process image using OpenAI Vision model (GPT-4 Turbo with Vision)
const processImageWithOpenAI = async (imageBuffer) => {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts structured data from invoice images.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the Team Name, Match Date, Match Time, and Invoice ID from this invoice image.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || "";
    console.log("AI Response:", text);

    // Basic extraction using RegEx (Adjust patterns as per invoice structure)
    const teamName =
      /Team\s*Name[:\-]?\s*(.*)/i.exec(text)?.[1]?.trim() || "Not found";
    const matchDate =
      /Match\s*Date[:\-]?\s*(.*)/i.exec(text)?.[1]?.trim() || "Not found";
    const matchTime =
      /Match\s*Time[:\-]?\s*(.*)/i.exec(text)?.[1]?.trim() || "Not found";
    const invoiceId =
      /Invoice\s*ID[:\-]?\s*(.*)/i.exec(text)?.[1]?.trim() || "Not found";

    return { teamName, matchDate, matchTime, invoiceId };
  } catch (error) {
    console.error("Error processing image:", error.message);
    return null;
  }
};

// Function to send message via Twilio WhatsApp
const sendMessage = async (to, message) => {
  await client.messages.create({
    from: `whatsapp:${fromWhatsAppNumber}`,
    to,
    body: message,
  });
};

module.exports = {
  webhook,
};
