type Player = {
  team: string;
  image: string;
};

export const IPL_PLAYERS: Record<string, Player> = {
  // ✅ Chennai Super Kings (CSK)
  "Ruturaj Gaikwad": { team: "CSK", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/102.png" },
  "Rahul Tripathi": { team: "CSK", image: "https://scontent.fmaa8-1.fna.fbcdn.net/v/t39.30808-6/468402852_982711187234076_8925912968949385228_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=eoGOFs4araIQ7kNvgF--jO7&_nc_oc=Adjf58jCwGkYK9rYERT1vZAyCIe8csqG3nvkP1iqnYKKQbDKlXMl0v4ezC8ucsZbunk&_nc_zt=23&_nc_ht=scontent.fmaa8-1.fna&_nc_gid=ANBgV_f6sgANAYwnZonMHWX&oh=00_AYHnKiODZ7s6c1BWwtf1RJaaDwG_Nw52-RrD4F5V25QYYw&oe=67D23F87" },
  "Shivam Dube": { team: "CSK", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/211.png" },
  "Ravindra Jadeja": { team: "CSK", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/46.png" },
  "MS Dhoni": { team: "CSK", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/57.png" },
  "Ravichandran Ashwin": { team: "CSK", image: "https://images.news18.com/ibnlive/uploads/2024/11/ravichandran-ashwin-ipl-2025-mega-auction-ipl-2025-auction-2024-11-c51120a7b2af17c391494e76e2b68cc9-16x9.jpg?impolicy=website&width=640&height=360" },
  "Anshul Kamboj": { team: "CSK", image: "https://feeds.abplive.com/onecms/images/uploaded-images/2024/11/25/f2e1061c4533d7fcedf92ef2a6c98b7a17325433177921131_original.jpeg?impolicy=abp_cdn&imwidth=1200&height=675" },

  // ✅ Mumbai Indians (MI)
  "Rohit Sharma": { team: "MI", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/6.png" },
  "Naman Dhir": { team: "MI", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3107.png" },
  "Suryakumar Yadav": { team: "MI", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/174.png" },
  "Tilak Varma": { team: "MI", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/993.png" },
  "Hardik Pandya": { team: "MI", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/54.png" },
  // "Robin Minz": { team: "MI", image: "/default-player.png" },
  "Deepak Chahar": { team: "MI", image: "https://statico.sportskeeda.com/editor/2025/01/1fda9-17358317348920-1920.jpg" },
  "Jasprit Bumrah": { team: "MI", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/9.png" },

  // ✅ Royal Challengers Bengaluru (RCB)
  "Virat Kohli": { team: "RCB", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png" },
  "Rajat Patidar": { team: "RCB", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/597.png" },
  "Krunal Pandya": { team: "RCB", image: "https://newsisland.in/wp-content/uploads/2024/12/Screenshot_153.png" },
  "Jitesh Sharma": { team: "RCB", image: "" },
  "Rasikh Dar": { team: "RCB", image: "" },
  "Bhuvneshwar Kumar": { team: "RCB", image: "https://scontent.fmaa8-1.fna.fbcdn.net/v/t39.30808-6/469703898_619896960609838_2017834388911603510_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=F5ooMtvsk2YQ7kNvgFbzuwQ&_nc_oc=AdidxJ592nNfL48lbKTEAOPCvV0pBkQScRjMz51U7FaGYfqnhcnbgSTj_JWYnt1Ti1o&_nc_zt=23&_nc_ht=scontent.fmaa8-1.fna&_nc_gid=AQ0jy6A5jNeaNrN23pD8iCv&oh=00_AYHNoVudOqlP5Rw5uqYuZyjaxByHjQygQeSjmkJXaJvgyw&oe=67D24F61" },
  "Yash Dayal": { team: "RCB", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/978.png" },

  // ✅ Kolkata Knight Riders (KKR)
  "Venkatesh Iyer": { team: "KKR", image: "https://ipltable.in/wp-content/uploads/2024/03/image-84.jpeg" },
  "Angkrish Raghuvanshi": { team: "KKR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/787.png" },
  "Rinku Singh": { team: "KKR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/152.png" },
  "Ramandeep Singh": { team: "KKR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/991.png" },
  "Varun Chakaravarthy": { team: "KKR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/140.png" },
  "Harshit Rana": { team: "KKR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1013.png" },
  "Vaibhav Arora": { team: "KKR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/583.png" },

  // ✅ Sunrisers Hyderabad (SRH)
  "Abhishek Sharma": { team: "SRH", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/212.png" },
  "Ishan Kishan": { team: "SRH", image: "https://www.sunrisershyderabad.in/uploads/image/SRH-674db77f6a6912.64737314ebguc3mr.png" },
  "Nitish Kumar Reddy": { team: "SRH", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1944.png" },
  // "Sachin Baby": { team: "SRH", image: "/default-player.png" },
  "Abhinav Manohar": { team: "SRH", image: "https://www.sunrisershyderabad.in/uploads/image/SRH-674ed806b4d6e8.00240767c8pdrgxa.png" },
  "Harshal Patel": { team: "SRH", image: "https://www.sunrisershyderabad.in/uploads/image/SRH-674ed5040c8d85.51345274i7gqsc2).png" },
  "Rahul Chahar": { team: "SRH", image: "" },
  "Mohammed Shami": { team: "SRH", image: "https://www.sunrisershyderabad.in/uploads/image/SRH-674db5d6cdda71.71693579kworub49.png" },

   // ✅ Rajasthan Royals (RR)
   "Yashasvi Jaiswal": { team: "RR", image: "https://assets.iplt20.com/ipl/IPLHeadshot2022/13538.png" },
   "Nitish Rana": { team: "RR", image: "https://www.rajasthanroyals.com/static-assets/images/players/63649.png?v=6.84" },
   "Riyan Parag": { team: "RR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/189.png" },
   "Dhruv Jurel": { team: "RR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1004.png" },
   "Shubham Dubey": { team: "RR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3112.png" },
   "Sandeep Sharma": { team: "RR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/220.png" },
   "Sanju Samson": { team: "RR", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/190.png" },
 
   // ✅ Punjab Kings (PBKS)
   "Prabhsimran Singh": { team: "PBKS", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/137.png" },
   "Shreyas Iyer": { team: "PBKS", image: "https://www.punjabkingsipl.in/static-assets/images/players/63961.png?v=6.18" },
   "Nehal Wadhera": { team: "PBKS", image: "https://www.punjabkingsipl.in/static-assets/images/players/69657.png?v=6.18" },
   "Shashank Singh": { team: "PBKS", image: "https://www.punjabkingsipl.in/static-assets/images/players/63520.png?v=6.18" },
   "Harpreet Brar": { team: "PBKS", image: "https://www.punjabkingsipl.in/static-assets/images/players/70500.png?v=6.18" },
   "Arshdeep Singh": { team: "PBKS", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/125.png" },
   "Yuzvendra Chahal": { team: "PBKS", image: "https://www.punjabkingsipl.in/static-assets/images/players/9844.png?v=6.18" },
 
   // ✅ Delhi Capitals (DC)
   "KL Rahul": { team: "DC", image: "https://www.threads.net/@bossman_kl_rahul_001/post/DCwRfKxzyq5" },
   "Abishek Porel": { team: "DC", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1580.png" },
   "Axar Patel": { team: "DC", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/110.png" },
   "Sameer Rizvi": { team: "DC", image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/397400/397425.4.png" },
   "Ashutosh Sharma": { team: "DC", image: "" },
   "Kuldeep Yadav": { team: "DC", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/14.png" },
   "Mukesh Kumar": { team: "DC", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1462.png" },
 
   // ✅ Gujarat Titans (GT)
   "Shubman Gill": { team: "GT", image: "https://www.gujarattitansipl.com/static-assets/images/players/66818.png?v=5.22" },
   "Sai Sudharsan": { team: "GT", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/976.png" },
   "Shahrukh Khan": { team: "GT", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/590.png" },
   "Washington Sundar": { team: "GT", image: "https://www.gujarattitansipl.com/static-assets/images/players/65859.png?v=5.22" },
   "Rahul Tewatia": { team: "GT", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/120.png" },
  //  "Rashid Khan": { team: "GT", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2885.png" },
   "Prasidh Krishna": { team: "GT", image: "https://www.gujarattitansipl.com/static-assets/images/players/65702.png?v=5.22" },
   "Mohammed Siraj": { team: "GT", image: "https://www.gujarattitansipl.com/static-assets/images/players/65799.png?v=5.22" },
  //  "Prasidh Krishna": { team: "GT", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3832.png" },
 
   // ✅ Lucknow Super Giants (LSG)
   "Rishabh Pant": { team: "LSG", image: "https://www.lucknowsupergiants.in/static-assets/images/players/65756.png?v=12.55" },
   "Ayush Badoni": { team: "LSG", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/985.png" },
   "Shahbaz Ahamad": { team: "LSG", image: "https://www.lucknowsupergiants.in/static-assets/images/players/58223.png?v=12.55" },
   "Ravi Bishnoi": { team: "LSG", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/520.png" },
   "Avesh Khan": { team: "LSG", image: "https://documents.iplt20.com/ipl/IPLHeadshot2023/109.png" },
   "Mayank Yadav": { team: "LSG", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/987.png" },
   "Mohsin Khan": { team: "LSG", image: "https://documents.iplt20.com/ipl/IPLHeadshot2024/541.png" },
 };

export default IPL_PLAYERS;
