type Player = {
  team: string;
  image: string;
};

export const IPL_PLAYERS: Record<string, Player> = {
  // ✅ Chennai Super Kings (CSK)
  "MS Dhoni": {
    team: "CSK",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/57.png",
  },
  "Ruturaj Gaikwad": {
    team: "CSK",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/5443.png",
  },
  "Ravindra Jadeja": {
    team: "CSK",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/46.png",
  },
  "Deepak Chahar": {
    team: "CSK",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/140.png",
  },

  // ✅ Mumbai Indians (MI)
  "Rohit Sharma": {
    team: "MI",
    image: "https://h.cricapi.com/img/players/03bda674-3916-4d64-952e-00a6c19c01e1.jpg",
  },
  "Jasprit Bumrah": {
    team: "MI",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/9.png",
  },
  "Suryakumar Yadav": {
    team: "MI",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/108.png",
  },
  "Ishan Kishan": {
    team: "MI",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2975.png",
  },

  // ✅ Royal Challengers Bengaluru (RCB)
  "Virat Kohli": {
    team: "RCB",
    image: "https://wallpapers.com/images/high/rcb-right-hand-batsman-virat-kohli-8fc3d51lbggmfbfp.webp",
  },
  "Faf du Plessis": {
    team: "RCB",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/24.png",
  },
  "Mohammed Siraj": {
    team: "RCB",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3840.png",
  },
  "Glenn Maxwell": {
    team: "RCB",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/282.png",
  },

  // ✅ Kolkata Knight Riders (KKR)
  "Shreyas Iyer": {
    team: "KKR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1563.png",
  },
  "Andre Russell": {
    team: "KKR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/177.png",
  },
  "Sunil Narine": {
    team: "KKR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/203.png",
  },
  "Rinku Singh": {
    team: "KKR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3830.png",
  },

  // ✅ Rajasthan Royals (RR)
  "Jos Buttler": {
    team: "RR",
    image: "https://static.iplt20.com/players/210/509.png",
  },
  "Sanju Samson": {
    team: "RR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/258.png",
  },
  "Yuzvendra Chahal": {
    team: "RR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/111.png",
  },
  "Trent Boult": {
    team: "RR",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/969.png",
  },

  // ✅ Lucknow Super Giants (LSG)
  "KL Rahul": {
    team: "LSG",
    image: "https://static.iplt20.com/players/210/1125.png",
  },
  "Quinton de Kock": {
    team: "LSG",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/834.png",
  },
  "Marcus Stoinis": {
    team: "LSG",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/152.png",
  },
  "Ravi Bishnoi": {
    team: "LSG",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3841.png",
  },

  // ✅ Delhi Capitals (DC)
  "David Warner": {
    team: "DC",
    image: "https://static.iplt20.com/players/210/170.png",
  },
  "Prithvi Shaw": {
    team: "DC",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3767.png",
  },
  "Anrich Nortje": {
    team: "DC",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/967.png",
  },
  "Axar Patel": {
    team: "DC",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1113.png",
  },

  // ✅ Sunrisers Hyderabad (SRH)
  "Aiden Markram": {
    team: "SRH",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2972.png",
  },
  "Bhuvneshwar Kumar": {
    team: "SRH",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/116.png",
  },
  "Heinrich Klaasen": {
    team: "SRH",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2975.png",
  },
  "Abhishek Sharma": {
    team: "SRH",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3760.png",
  },

  // ✅ Gujarat Titans (GT)
  "Shubman Gill": {
    team: "GT",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3769.png",
  },
  "Rashid Khan": {
    team: "GT",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2885.png",
  },
  "Mohammed Shami": {
    team: "GT",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/94.png",
  },
  "Kane Williamson": {
    team: "GT",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/440.png",
  },

  // ✅ Punjab Kings (PBKS)
  "Shikhar Dhawan": {
    team: "PBKS",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/41.png",
  },
  "Liam Livingstone": {
    team: "PBKS",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3644.png",
  },
  "Arshdeep Singh": {
    team: "PBKS",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/4698.png",
  },
  "Sam Curran": {
    team: "PBKS",
    image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2939.png",
  },
};

export default IPL_PLAYERS;
