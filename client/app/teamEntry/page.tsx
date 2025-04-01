'use client'
import { useState } from "react";
import TeamEntry from "../../components/TeamEntry";
import Contest from "../../components/Contest";
export default function Home() {
  const [option,setOption] =useState("team");
  return (
    <div >
      {/* <Header/> */}
      {option==="team" && <TeamEntry option={option} setOption={setOption}/>}
      {option==="contest" && <Contest option={option} setOption={setOption}/>}
    </div>
  );
}
