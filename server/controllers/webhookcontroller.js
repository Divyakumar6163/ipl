const { OpenAI } = require("openai");
const UserSession = require("../models/UserWhatsApp");
const Team = require("../models/team");
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

const webhook = async (req, res) => {
  try {
    const from = req.body.From;
    const mediaUrl = req.body.MediaUrl0;
    const incomingMessage = req.body.Body?.trim().toLowerCase();

    console.log("From:", from);
    console.log("Incoming Message:", incomingMessage);

    // ✅ Check if user exists in DB
    let existingSession = await UserSession.findOne({ from });
    console.log("Existing Session:", existingSession);
    // ✅ First-time user welcome
    if (existingSession === null || !existingSession) {
      await UserSession.create({ from, waitingForImage: true });
      await sendMessage(
        from,
        `👋 *Hello!* Welcome to *Fantasy Rank Checker*!\n\n✨ I can help you check your *current ranking and score*.\n\n📸 Please upload a *clear photo of your receipt* to get started!`
      );
      // return res.sendStatus(200);
    }

    // ✅ Handle 'Yes' or 'No' Messages
    if (
      incomingMessage === "yes" ||
      incomingMessage === "no" ||
      incomingMessage === "n"
    ) {
      if (incomingMessage === "yes" || incomingMessage === "n") {
        await UserSession.findOneAndUpdate({ from }, { waitingForImage: true });
        await sendMessage(
          from,
          "📸 Please upload a *clear photo of your receipt* to proceed."
        );
      } else {
        await sendMessage(
          from,
          "No problem! Thank you for using *Fantasy Rank Checker*. Have a great day! 😊"
        );
        await UserSession.deleteOne({ from });
      }
      // return res.sendStatus(200);
    }

    // ✅ Check if waiting for an image
    if (existingSession.waitingForImage && mediaUrl) {
      await sendMessage(from, "⏳ Processing your Receipt...");

      const imageBuffer = await downloadImage(mediaUrl);
      const extractedData = await processImageWithOpenAI(imageBuffer);

      if (!extractedData) {
        await sendMessage(
          from,
          "❌ Couldn't extract details. Please try with a clearer image."
        );
        // return res.sendStatus(200);
      }

      // ✅ Persist session with extracted data
      await UserSession.findOneAndUpdate(
        { from },
        {
          waitingForImage: false,
          invoiceId: extractedData.invoiceId,
          teamName: extractedData.teamName,
          matchDate: extractedData.matchDate,
          matchTime: extractedData.matchTime,
        }
      );

      await sendMessage(
        from,
        `📄 *Extracted Details:*\n\n🧾 *Receipt ID:* ${extractedData.invoiceId}\n🏏 *Team:* ${extractedData.teamName}\n📅 *Date:* ${extractedData.matchDate}\n⏰ *Time:* ${extractedData.matchTime}\n\n✅ Reply with *'Y'* if correct or *'N'* if not.`
      );
      // return res.sendStatus(200);
    }

    // ✅ Process Match Details if Not Waiting for Image
    if (!existingSession.waitingForImage && incomingMessage === "y") {
      await sendMessage(
        from,
        "✅ Thank you! Your Receipt details have been *verified successfully*. Processing further..."
      );

      if (existingSession && existingSession.invoiceId !== "Not found") {
        try {
          const backendResponse = await axios.get(
            `${process.env.BACKEND_LINK}/matchdetails/${existingSession.invoiceId}`
            // { validateStatus: () => true }
          );
          // console.log(
          //   "Backend Response:",
          //   backendResponse.data,
          //   "status",
          //   backendResponse.status
          // );
          console.log(backendResponse.data.matchDetail.matchCompletion);
          if (!backendResponse.data.matchDetail.matchCompletion) {
            await sendMessage(
              from,
              "Match Not Started yet, Please try later.\n\n❓ *Do you want to check another receipt status?*\n\nReply with *'Yes'* or *'No'*."
            );
            return;
          }
          if (backendResponse.status === 200) {
            const matchData = backendResponse.data.matchDetail;
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
            console.log("rank response: ", rankResponse.status);

            let teamRankData = null;
            if (rankResponse.status !== 404) {
              const rankData = rankResponse.data.rankings;
              teamRankData = rankData.find(
                (team) => team.teamId === matchData._id
              );
            }

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

              if (prizeResponse.data.prize > 0) {
                await sendMessage(
                  from,
                  `🎉 *Congratulations!* 🎉\n\n🏆 *You have won:* ₹${prizeResponse.data.prize}\n📊 *Rank:* ${teamRankData?.rank}\n⭐ *Total Score:* ${teamRankData?.score}`
                );
              } else {
                await sendMessage(
                  from,
                  `🙏 *Better Luck Next Time!*\n\n📊 *Rank:* ${teamRankData?.rank}\n⭐ *Total Score:* ${teamRankData?.score}`
                );
              }
            }
          } else {
            await sendMessage(
              from,
              "�� *Error fetching match details. Please try again later.*"
            );
          }
        } catch (err) {
          console.error("Backend call failed:", err.message);
          await sendMessage(
            from,
            "⚠️ Error processing your Receipt. Please try again later."
          );
        }
      }
      // return res.sendStatus(200);
    }
  } catch (error) {
    console.error("Webhook Error:", error.message);
    // return res.sendStatus(500);
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

// ✅ Function to Send WhatsApp Message via Twilio
const sendMessage = async (to, message) => {
  console.log("Sending message to:", to);
  await client.messages.create({
    from: fromWhatsAppNumber,
    to,
    body: message,
  });
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
