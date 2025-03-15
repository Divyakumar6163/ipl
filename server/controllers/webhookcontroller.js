const { OpenAI } = require("openai");
const Team = require("../models/team"); // Assuming your Team schema is here
const axios = require("axios");
const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// Twilio Credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const client = twilio(accountSid, authToken);

// OpenAI Configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory tracking for users and invoice data
const userHistory = new Set();
const userInvoiceMap = new Map(); // Store {from: extractedInvoiceData}

// ✅ WhatsApp Webhook Controller
const webhook = async (req, res) => {
  try {
    const from = req.body.From;
    const mediaUrl = req.body.MediaUrl0;
    const incomingMessage = req.body.Body?.trim().toLowerCase();

    console.log("From:", from);
    console.log("Incoming Message:", req.body);

    // ✅ First-time user welcome
    if (!userHistory.has(from)) {
      userHistory.add(from);
      await sendMessage(
        from,
        `👋 *Hello!* Welcome to *Fantasy Rank Checker*!\n\n✨ I can help you check your *current ranking and score*.\n\n📸 Please upload a *clear photo of your receipt* to get started!`
      );
      return null;
    }

    // ✅ If user replies 'yes' or 'no' (for confirmation)
    if (incomingMessage === "yes" || incomingMessage === "no") {
      const lastInvoiceData = userInvoiceMap.get(from);

      if (incomingMessage === "yes") {
        await sendMessage(
          from,
          "✅ Thank you! Your Receipt details have been *verified successfully*. Processing further..."
        );

        // ✅ Backend call with Invoice ID for further processing
        if (lastInvoiceData && lastInvoiceData.invoiceId !== "Not found") {
          try {
            const backendResponse = await axios.get(
              `${process.env.BACKEND_LINK}/matchdetails/${lastInvoiceData.invoiceId}`,
              { headers: { "Content-Type": "application/json" } }
            );
            if (backendResponse.status === 200) {
              const matchData = backendResponse.data.matchDetail;
              console.log(matchData);
              const rankResponse = await axios.post(
                `${process.env.BACKEND_LINK}/getrank`,
                {
                  team1: matchData.team1,
                  team2: matchData.team2,
                  matchDate: matchData.matchDate,
                  matchTime: matchData.matchTime,
                  contestPrice: matchData.price,
                },
                { validateStatus: () => true }
              );
              let teamRankData = null;
              if (rankResponse.status === 404) {
                await sendMessage(from, "Match Not Started yet.");
              } else {
                const rankData = rankResponse.data.rankings;
                teamRankData = rankData.find(
                  (team) => team.teamId === matchData._id
                );
              }
              console.log("Rank Response:", teamRankData);
              if (matchData.matchCompletion && rankResponse.status !== 404) {
                const prizeResponse = await axios.post(
                  `${process.env.BACKEND_LINK}/getprize`,
                  {
                    team1: matchData.team1,
                    team2: matchData.team2,
                    matchDate: matchData.matchDate,
                    matchTime: matchData.matchTime,
                    contestPrice: matchData.price,
                    teamID: matchData._id,
                    rank: teamRankData?.rank,
                  }
                );
                console.log("Prize Response:", prizeResponse.data.prize);
                if (prizeResponse.data.prize > 0) {
                  await sendMessage(
                    from,
                    `🎉 *Congratulations!* 🎉\n\n` +
                      `🏆 *You have won:* ₹${prizeResponse.data.prize}\n` +
                      `📊 *Rank:* ${teamRankData?.rank}\n` +
                      `⭐ *Total Score:* ${teamRankData?.score}\n\n` +
                      `Thank you for participating! Stay tuned for more contests!`
                  );
                } else {
                  await sendMessage(
                    from,
                    `🙏 *Better Luck Next Time!* 🙏\n\n` +
                      `📊 *Rank:* ${teamRankData?.rank}\n` +
                      `⭐ *Total Score:* ${teamRankData?.score}\n\n` +
                      `Keep trying! More chances to win in upcoming contests! 💪`
                  );
                }
              } else if (rankResponse.status !== 404) {
                const scoreResponse = await axios.post(
                  `${process.env.BACKEND_LINK}/getscore`,
                  {
                    team1: matchData.team1,
                    team2: matchData.team2,
                    matchDate: matchData.matchDate,
                    matchTime: matchData.matchTime,
                    players: matchData.players,
                    contestPrice: matchData.price,
                  },
                  { validateStatus: () => true }
                );
                console.log("Score Response:", scoreResponse.status);
                const scoreData = scoreResponse.data.players;

                const updatedScores = matchData.players.map((player) => ({
                  name: player,
                  totalScore: scoreData[player] || 0,
                }));

                // 🔹 Format player scores in a structured way
                let playerScoresMessage = updatedScores
                  .map(
                    (player, index) =>
                      `${index + 1}. ${player.name} - ⭐ ${player.totalScore}`
                  )
                  .join("\n");

                // 🔹 Final Message
                const finalMessage =
                  `📊 *Your Current Status:*\n\n` +
                  `🏅 *Rank:* ${teamRankData?.rank}\n` +
                  `⭐ *Total Score:* ${teamRankData?.score}\n\n` +
                  `🎯 *Player Scores:*\n${playerScoresMessage}\n\n` +
                  `Stay tuned for updates! 🏏`;

                // 🔹 Send Message
                await sendMessage(from, finalMessage);
              }
            }
          } catch (err) {
            console.error("Backend call failed:", err.message);
            await sendMessage(
              from,
              "⚠️ Error processing your Receipt. Please try again later."
            );
          }
        } else {
          await sendMessage(
            from,
            "⚠️ Receipt ID missing. Please resend the image."
          );
        }
      } else {
        await sendMessage(
          from,
          "❌ No problem! Please resend a *clearer image* of your Receipt."
        );
      }

      userInvoiceMap.delete(from); // Clear the map entry after user confirms
      return null;
    }

    // ✅ Handle Image Invoice Processing
    if (mediaUrl) {
      await sendMessage(
        from,
        "⏳ Please wait while we are *processing your Receipt*..."
      );

      const imageBuffer = await downloadImage(mediaUrl);
      const extractedData = await processImageWithOpenAI(imageBuffer);
      console.log("Extracted Data:", extractedData);

      if (!extractedData) {
        await sendMessage(
          from,
          "❌ Couldn't extract details properly. Please try with a *clearer image*."
        );
        return null;
      }

      // ✅ Store extracted data for this user for future 'yes' response
      userInvoiceMap.set(from, extractedData);

      // ✅ Send extracted data for user confirmation (Corrected formatting)
      const message =
        `📄 *Extracted Receipt Details:*\n\n` +
        `🧾 *Receipt ID:* ${extractedData.invoiceId}\n` +
        `🏏 *Team Name:* ${extractedData.teamName}\n` +
        `📅 *Match Date:* ${extractedData.matchDate}\n` +
        `⏰ *Match Time:* ${extractedData.matchTime}\n` +
        `✅ Reply with *'Yes'* if correct or *'No'* if incorrect.`;

      await sendMessage(from, message);
      return null;
    }

    // ✅ For known users, if neither image nor yes/no, ask for invoice
    if (userHistory.has(from)) {
      await sendMessage(
        from,
        "❗ Please upload a *clear photo* of your Receipt to proceed."
      );
    }

    return null;
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.sendStatus(500);
  }
};

// ✅ Function to Download Image from URL
const downloadImage = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    auth: { username: accountSid, password: authToken },
  });
  return Buffer.from(response.data, "binary");
};

// ✅ Function to Process Image using OpenAI Vision Model
const processImageWithOpenAI = async (imageBuffer) => {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Extract Team Name, Match Date, Match Time, and Receipt ID from the given image. Respond with only the values in plain format without any extra text, stars (*), or colons (:). 
            Example response 
            Receipt ID: 67d475a917dd7c9f36f0ecd1
            Team Name: Mumbai Indians vs Rajasthan Royals
            Match Date: 25 March 2025
            Match Time: 7:30pm
            `,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract the required details." },
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
    console.log("AI Extracted Text:", text);

    // ✅ Advanced Clean function: removes extra symbols like :, *, spaces, and trims
    const cleanField = (value) =>
      value
        ?.replace(/^[:\*\s]+/, "") // Remove leading ':', '*', spaces
        .replace(/[:\*\s]+$/, "") // Remove trailing ':', '*', spaces
        .trim() || "Not found";

    // ✅ Extract and Clean Fields using Regex
    const teamName = cleanField(/Team\s*Name[:\-]?\s*(.*)/i.exec(text)?.[1]);
    const matchDate = cleanField(/Match\s*Date[:\-]?\s*(.*)/i.exec(text)?.[1]);
    const matchTime = cleanField(/Match\s*Time[:\-]?\s*(.*)/i.exec(text)?.[1]);
    const invoiceId = cleanField(/Receipt\s*ID[:\-]?\s*(.*)/i.exec(text)?.[1]); // Assuming now we call it Receipt ID

    console.log({
      teamName,
      matchDate,
      matchTime,
      invoiceId,
    });

    return { teamName, matchDate, matchTime, invoiceId };
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return null;
  }
};

// ✅ Function to Send WhatsApp Message via Twilio
const sendMessage = async (to, message) => {
  console.log("Sending message to:", to);
  await client.messages.create({
    from: fromWhatsAppNumber,
    to,
    body: message,
  });
};

const matchdetails = async (req, res) => {
  try {
    const { teamID } = req.params;
    console.log("Team ID:", teamID);
    if (!teamID) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    // ✅ Find match details where teamID is included in teams array
    const matchDetail = await Team.findOne({ _id: teamID.trim() });

    // ✅ If no match details found
    if (!matchDetail) {
      return res
        .status(404)
        .json({ message: "Invalid Receipt ID / Team ID. No match found." });
    }

    // ✅ If found, send match details
    return res.status(200).json({
      message: "Match details fetched successfully",
      matchDetail,
    });
  } catch (error) {
    console.error("Error fetching match details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  webhook,
  matchdetails,
};
