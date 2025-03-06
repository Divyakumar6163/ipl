import CSK from "../../public/teamLogo/csk.png";
import DC from "../../public/teamLogo/dc.png";
import GT from "../../public/teamLogo/gt.png";
import KKR from "../../public/teamLogo/kkr.png";
import LSG from "../../public/teamLogo/lsg.png";
import MI from "../../public/teamLogo/mi.jpeg";
import PBKS from "../../public/teamLogo/pk.png";
import RCB from "../../public/teamLogo/rcb.png";
import SRH from "../../public/teamLogo/srh.png";
import RR from "../../public/teamLogo/rr.png";
export type IPLTeam = {
    short: string;
    logo: any;
  };
  
  export const IPL_TEAMS: Record<string, IPLTeam> = {
    "Chennai Super Kings": {
      short: "CSK",
      logo: CSK,
    },
    "Mumbai Indians": {
      short: "MI",
      logo:MI,
    },
    "Royal Challengers Bengaluru": {
      short: "RCB",
      logo:RCB,
    },
    "Kolkata Knight Riders": {
      short: "KKR",
      logo: KKR,
    },
    "Sunrisers Hyderabad": {
      short: "SRH",
      logo: SRH,
    },
    "Delhi Capitals": {
      short: "DC",
      logo: DC,
    },
    "Punjab Kings": {
      short: "PBKS",
      logo: PBKS,
    },
    "Rajasthan Royals": {
      short: "RR",
      logo:RR,
    },
    "Gujarat Titans": {
      short: "GT",
      logo: GT,
    },
    "Lucknow Super Giants": {
      short: "LSG",
      logo: LSG,
    },
  };
  
  export default IPL_TEAMS;
  