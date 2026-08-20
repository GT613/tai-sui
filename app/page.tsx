"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Screen = "home" | "loadout" | "field" | "result";
type DifficultyKey = "mist" | "abyss" | "fate";
type Combat = { name: string; hp: number; max: number; damage: number } | null;

const characters = [
  { id: "xi-ping", name: "奚平", title: "永宁侯世子 · 飞琼峰门下", relation: "本作主角。称庄王周楹为“三哥”，后拜飞琼峰主支修为师。", trait: "转生木回响：探测高价值物资" },
  { id: "zhi-xiu", name: "支修", title: "玄隐飞琼峰主", relation: "奚平之师，曾为大宛名将；剑意清正，护短而不纵容。", trait: "照庭剑意：首次受击减半" },
  { id: "zhou-ying", name: "周楹", title: "庄王", relation: "奚平的表兄与“三哥”；白令是其暗卫首领。", trait: "筹谋：撤离结算额外 +12%" },
  { id: "lin-chi", name: "林炽", title: "玄隐镀月峰主 · 点金手", relation: "仿金术与仙器降格的重要推动者，让镀月金走入凡间。", trait: "点金：降格仙器耐久 +1" },
  { id: "wen-fei", name: "闻斐", title: "玄隐锦霞峰主", relation: "与飞琼峰相邻，以折扇显字交流，是玄隐诸峰主之一。", trait: "灵药：每局额外携带一枚丹药" },
  { id: "duan-rui", name: "端睿", title: "大长公主 · 碧潭峰", relation: "玄隐重要峰主，辈分与修为深厚，行事清冷严正。", trait: "幽玄经：灵相上限 +10" },
  { id: "wei-chengxiang", name: "魏诚响", title: "不平之鸣", relation: "从南郊底层困境中走出，与“不平蝉”一线密切相关。", trait: "不平蝉：残血伤害提高" },
  { id: "pang-jian", name: "庞戬", title: "天机阁右副都统", relation: "坐镇京师的人间行走，负责青龙塔与邪祟异常。", trait: "人间行走：开局标记一个威胁" },
  { id: "xi-yue", name: "奚悦", title: "半偶", relation: "由奚平重新命名的半偶，沉默而忠诚，与奚平关系深厚。", trait: "半偶之躯：负重上限 +1" },
];
const difficulties = {
  mist: { name: "巡雾", tag: "适合初见", mult: 1, enemy: 10, pulse: 5, spirit: 100, color: "#9ab9a6" },
  abyss: { name: "潜渊", tag: "进阶风险", mult: 1.6, enemy: 14, pulse: 4, spirit: 88, color: "#d5b47b" },
  fate: { name: "逆命", tag: "高危高偿", mult: 2.4, enemy: 18, pulse: 3, spirit: 76, color: "#c66c68" },
};
const tiles = Array.from({ length: 35 }, (_, i) => ({ id: i, type: ([3, 9, 18, 26].includes(i) ? "cache" : [7, 16, 24, 30].includes(i) ? "enemy" : i === 34 ? "exit" : [5, 12, 20, 28].includes(i) ? "hazard" : "path") as "cache" | "enemy" | "exit" | "hazard" | "path" }));
const lootDeck = [
  { name: "青矿灵石", value: 120, weight: 1, objective: false },
  { name: "镀月金机芯", value: 260, weight: 2, objective: false },
  { name: "南郊工坊账册", value: 480, weight: 1, objective: true },
  { name: "封灵匣", value: 340, weight: 2, objective: false },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("mist");
  const [support, setSupport] = useState("zhi-xiu");
  const [position, setPosition] = useState(0);
  const [hp, setHp] = useState(100);
  const [spirit, setSpirit] = useState(100);
  const [noise, setNoise] = useState(8);
  const [turn, setTurn] = useState(0);
  const [searched, setSearched] = useState<number[]>([]);
  const [defeated, setDefeated] = useState<number[]>([]);
  const [loot, setLoot] = useState<typeof lootDeck>([]);
  const [combat, setCombat] = useState<Combat>(null);
  const [log, setLog] = useState("雾压得很低。转生木的回响从工坊深处传来。");
  const [tutorial, setTutorial] = useState(0);
  const [codex, setCodex] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [muted, setMuted] = useState(true);
  const [result, setResult] = useState<"success" | "fallen" | "retreat">("success");
  const audioRef = useRef<HTMLAudioElement>(null);
  const d = difficulties[difficulty];
  const currentTile = tiles[position];
  const weight = loot.reduce((sum, item) => sum + item.weight, 0);
  const capacity = support === "xi-yue" ? 7 : 6;
  const objective = loot.some((item) => item.objective);
  const value = Math.round(loot.reduce((sum, item) => sum + item.value, 0) * d.mult * (support === "zhou-ying" ? 1.12 : 1));
  const adjacent = useMemo(() => { const row = Math.floor(position / 7), col = position % 7; return tiles.filter((t) => { const r = Math.floor(t.id / 7), c = t.id % 7; return Math.abs(r - row) + Math.abs(c - col) === 1; }).map((t) => t.id); }, [position]);

  useEffect(() => { if ((hp <= 0 || spirit <= 0) && screen === "field") { setResult("fallen"); setScreen("result"); } }, [hp, spirit, screen]);
  function toggleAudio() { if (!audioRef.current) return; if (muted) { audioRef.current.volume = .48; audioRef.current.play().catch(() => {}); } else audioRef.current.pause(); setMuted(!muted); }
  function resetRun() { setPosition(0); setHp(100); setSpirit(d.spirit); setNoise(8); setTurn(0); setSearched([]); setDefeated([]); setLoot([]); setCombat(null); setTutorial(1); setLog("任务开始：沿铁轨潜入，先熟悉移动。相邻区域已标亮。"); setScreen("field"); if (muted) toggleAudio(); }
  function move(id: number) {
    if (combat || !adjacent.includes(id)) return;
    const tile = tiles[id], newTurn = turn + 1; setPosition(id); setTurn(newTurn); setSpirit((v) => Math.max(0, v - (tile.type === "hazard" ? 8 : 4))); setNoise((v) => Math.min(100, v + (tile.type === "hazard" ? 10 : 3))); if (tutorial === 1) setTutorial(2);
    if (tile.type === "enemy" && !defeated.includes(id)) { setCombat({ name: "秽气傀儡", hp: 64, max: 64, damage: d.enemy }); setLog("齿轮声戛然而止——秽气附上废弃机偶，封住了前路。"); if (tutorial < 3) setTutorial(3); }
    else if (newTurn % d.pulse === 0) { setNoise((v) => Math.min(100, v + 12)); setLog("太岁脉动掠过地底，雾中威胁重新游移。暴露度上升。"); }
    else setLog(tile.type === "cache" ? "转生木回响变得清晰，这里可以搜索。" : tile.type === "exit" ? "撤离阵就在脚下，灵光正在响应。" : "脚步落进蒸汽与浓雾之间。暂未发现敌情。");
  }
  function search() { if (currentTile.type !== "cache" || searched.includes(position) || weight >= capacity) return; const item = lootDeck[searched.length % lootDeck.length]; if (weight + item.weight > capacity) { setLog("背包已无法容纳这件物资。需要丢弃物品或立即撤离。"); return; } setLoot((v) => [...v, item]); setSearched((v) => [...v, position]); setNoise((v) => Math.min(100, v + 11)); setSpirit((v) => Math.max(0, v - 3)); setLog(`取得【${item.name}】。${item.objective ? "任务证物已确认，撤离阵现可完成结算。" : "越值钱的东西，往往越不肯安静。"}`); if (tutorial === 2) setTutorial(3); }
  function drop(index: number) { const item = loot[index]; setLoot((v) => v.filter((_, i) => i !== index)); setLog(`放下【${item.name}】，负重已经减轻。`); }
  function fight(kind: "strike" | "seal" | "guard") { if (!combat) return; const damage = kind === "strike" ? 22 : kind === "seal" ? 36 : 0; if (kind === "seal" && spirit < 15) { setLog("灵相不足，无法催动符印。"); return; } if (kind === "seal") setSpirit((v) => v - 15); const remaining = combat.hp - damage; if (remaining <= 0) { setDefeated((v) => [...v, position]); setCombat(null); setNoise((v) => Math.max(0, v - 8)); setLog("傀儡的机芯熄灭。威胁已清除，前路恢复安静。"); setTutorial(4); return; } const incoming = kind === "guard" ? Math.ceil(combat.damage * .25) : combat.damage; setCombat({ ...combat, hp: remaining }); setHp((v) => Math.max(0, v - incoming)); setNoise((v) => Math.min(100, v + 6)); setLog(kind === "guard" ? `你稳住身形，格挡了大部分冲击（-${incoming}）。` : `命中傀儡，但它仍在逼近。你受到 ${incoming} 点伤害。`); }
  function extract() { if (position !== 34) return; setResult(objective ? "success" : "retreat"); setScreen("result"); }

  return <main className={`game-shell screen-${screen}`}>
    <audio ref={audioRef} src="/assets/audio/tai-sui-theme.mp3" loop preload="auto" /><div className="grain" aria-hidden="true" />
    <header className="topbar"><button className="brand" onClick={() => setScreen("home")} aria-label="返回首页"><b>太岁</b><span>雾下见天光</span></button><div className="top-meta"><span>TAIMING · 28</span><i /><span>改编支线演练</span></div><nav><button onClick={() => setCodex(true)}>人物志</button><button onClick={toggleAudio}>{muted ? "启乐" : "止乐"}</button></nav></header>
    {screen === "home" && <section className="home-screen"><div className="home-ink"><span>蒸汽朋克修真 · 搜打撤</span><h1>雾下<br />见天光</h1><p>金平的雾吞没了南郊工坊。循转生木回响入局，带回失踪的灵石账册——或者，在通天歧途夺走你之前撤离。</p><div className="home-actions"><button className="primary" onClick={() => setScreen("loadout")}>领取新手秘令 <em>→</em></button><button onClick={() => setCodex(true)}>查阅人物志</button></div></div><div className="home-portrait"><img src="/assets/portraits/xi-ping.webp" alt="奚平立绘" /><div className="portrait-caption"><b>奚平 · 士庸</b><span>红尘蝼蚁，也有它要走的路。</span></div></div><div className="home-stats"><div><b>09</b><span>原著角色</span></div><div><b>03</b><span>风险等级</span></div><div><b>∞</b><span>通天歧途</span></div></div></section>}
    {screen === "loadout" && <section className="loadout-screen"><div className="section-head"><span>MISSION / 001</span><h2>南郊失账</h2><p>新手秘令将逐步引导移动、搜索、战斗和撤离。所有收获只有成功撤离后才会入库。</p></div><div className="loadout-grid"><article className="mission-card"><div className="mission-bg" /><span className="stamp">新手</span><div><small>任务证物</small><h3>南郊工坊灵石账册</h3><p>镀月金机芯失窃后，工坊账目与一名管事同时消失。天机阁在废墟中测到异常灵气。</p><ul><li>搜索至少一处物资点</li><li>取得账册后抵达撤离阵</li><li>可提前撤离，但无法领取秘令赏金</li></ul></div></article><div className="choice-panel"><label>风险敕令 <small>难度越高，回报与脉动频率同步提高</small></label><div className="difficulty-list">{Object.entries(difficulties).map(([key, item]) => <button key={key} className={difficulty === key ? "active" : ""} onClick={() => setDifficulty(key as DifficultyKey)} style={{"--risk":item.color} as React.CSSProperties}><span>{item.name}<small>{item.tag}</small></span><b>× {item.mult.toFixed(1)}</b></button>)}</div><label>联络支援 <small>不进入主战场，不改变原著关系</small></label><div className="support-list">{characters.filter((c) => ["zhi-xiu","zhou-ying","pang-jian","xi-yue"].includes(c.id)).map((c) => <button key={c.id} className={support === c.id ? "active" : ""} onClick={() => setSupport(c.id)}><img src={`/assets/chibi/${c.id}.webp`} alt="" /><span>{c.name}<small>{c.trait}</small></span></button>)}</div><button className="deploy" onClick={resetRun}>踏入浓雾 <span>灵相 {d.spirit}</span></button></div></div></section>}
    {screen === "field" && <section className="field-screen"><aside className="field-left"><div className="mission-index"><span>秘令 001</span><h2>南郊失账</h2><p className={objective ? "done" : ""}>{objective ? "✓ 已取得账册" : "○ 搜寻工坊账册"}</p><p>○ 抵达东南撤离阵</p></div><div className="vitals"><Meter label="命元" value={hp} /><Meter label="灵相" value={spirit} /><Meter label="暴露" value={noise} danger /></div><div className="support"><span>联络支援</span><img src={`/assets/chibi/${support}.webp`} alt={characters.find(c=>c.id===support)?.name} /><div><b>{characters.find(c=>c.id===support)?.name}</b><small>{characters.find(c=>c.id===support)?.trait}</small></div></div></aside><div className="map-wrap"><div className="map-title"><span>JINPING · SOUTH WORKS</span><b>金平南郊 / 戌时三刻</b></div><div className={`map-grid pulse-${turn % d.pulse === 0 && turn > 0}`}>{tiles.map((tile) => { const canMove = adjacent.includes(tile.id); const hidden = Math.abs(Math.floor(tile.id / 7)-Math.floor(position/7))+Math.abs(tile.id%7-position%7) > 2; return <button key={tile.id} onClick={() => move(tile.id)} className={`tile tile-${tile.type} ${position===tile.id?"current":""} ${canMove?"reachable":""} ${searched.includes(tile.id)?"searched":""} ${defeated.includes(tile.id)?"cleared":""} ${hidden?"hidden":""}`} aria-label={`区域 ${tile.id+1}`}><span className="tile-mark">{tile.type === "cache" ? "◇" : tile.type === "enemy" ? "✦" : tile.type === "exit" ? "阵" : tile.type === "hazard" ? "≈" : "·"}</span>{position===tile.id && <img src="/assets/chibi/xi-ping.webp" alt="奚平当前位置" />}</button>})}</div><div className="map-legend"><span><i className="safe" />可移动</span><span><i className="loot" />物资回响</span><span><i className="threat" />已知威胁</span><span><i className="exit" />撤离阵</span></div></div><aside className="field-right"><div className="tutorial-card"><span>引路 / {Math.min(tutorial,4)} — 4</span><b>{tutorial===1?"移动":tutorial===2?"搜索":tutorial===3?"战斗":"撤离"}</b><p>{tutorial===1?"点击发亮的相邻区域。每次移动都会消耗灵相。":tutorial===2?"站在菱形回响点时搜索物资，注意背包负重。":tutorial===3?"遭遇邪祟后选攻击、符印或格挡。符印更强但消耗灵相。":"账册到手后前往东南角撤离阵。贪心会提高损失风险。"}</p></div><div className="context-actions"><button disabled={currentTile.type!=="cache" || searched.includes(position)} onClick={search}>搜寻此处 <span>暴露 +11</span></button><button disabled={position!==34} onClick={extract}>启动撤离阵 <span>{objective?"完整结算":"提前撤离"}</span></button></div><div className="pack"><header><span>乾坤袋</span><b>{weight} / {capacity}</b></header>{loot.length===0?<p>尚未取得物资</p>:loot.map((item,i)=><button key={`${item.name}-${i}`} onClick={()=>drop(i)}><span><b>{item.name}</b><small>{item.weight} 格 · {item.value} 铢</small></span><em>放下</em></button>)}<footer>预计结算 <b>{value} 铢</b></footer></div><div className="field-log"><span>灵讯</span><p>{log}</p></div></aside></section>}
    {combat && <div className="combat-overlay"><div className="combat-scene"><div className="enemy-figure"><div className="enemy-core" /><span>秽气傀儡</span></div><div className="combat-panel"><small>ENCOUNTER / 威胁接触</small><h2>{combat.name}</h2><div className="enemy-bar"><i style={{width:`${combat.hp/combat.max*100}%`}} /></div><p>废弃机偶被秽气操纵。它的齿轮正在锁定你的呼吸节奏。</p><div className="combat-actions"><button onClick={()=>fight("strike")}><b>裂风</b><span>22 伤害</span></button><button onClick={()=>fight("seal")}><b>镇邪符</b><span>36 伤害 / 灵相 -15</span></button><button onClick={()=>fight("guard")}><b>守势</b><span>减免 75% 伤害</span></button></div></div></div></div>}
    {screen === "result" && <section className={`result-screen result-${result}`}><div className="result-card"><span>MISSION COMPLETE / {result === "fallen" ? "行动失联" : "撤离完成"}</span><h2>{result === "success" ? "雾散一线" : result === "retreat" ? "知止而返" : "歧途无归"}</h2><p>{result === "success" ? "账册与所得物资已经封存。金平的雾仍未散，但有人从里面带回了证据。" : result === "retreat" ? "你保住了性命与随身物资，却错过了秘令赏金。下一次，转生木仍会回应。" : "灵相耗尽，未封存物资全部遗失。通天路从不因来者年轻而手下留情。"}</p><div className="result-numbers"><div><small>回收物资</small><b>{result === "fallen" ? 0 : loot.length}</b></div><div><small>风险倍率</small><b>× {d.mult.toFixed(1)}</b></div><div><small>入库价值</small><b>{result === "fallen" ? 0 : value}</b></div></div><div className="result-actions"><button className="primary" onClick={()=>setScreen("loadout")}>再次整备</button><button onClick={()=>setScreen("home")}>返回卷首</button></div></div><img src={`/assets/portraits/${support}.webp`} alt="联络角色立绘" /></section>}
    {codex && <div className="codex-overlay"><div className="codex-window"><header><div><span>玄隐 / 人物档案</span><h2>九人志</h2></div><button onClick={()=>setCodex(false)}>关闭 ×</button></header><div className="codex-body"><nav>{characters.map((c,i)=><button key={c.id} className={selectedCharacter===i?"active":""} onClick={()=>setSelectedCharacter(i)}><span>{String(i+1).padStart(2,"0")}</span>{c.name}</button>)}</nav><div className="codex-portrait"><img src={`/assets/portraits/${characters[selectedCharacter].id}.webp`} alt={`${characters[selectedCharacter].name}立绘`} /></div><article><span>{characters[selectedCharacter].title}</span><h3>{characters[selectedCharacter].name}</h3><p>{characters[selectedCharacter].relation}</p><div className="trait"><small>演练特性</small><b>{characters[selectedCharacter].trait}</b></div>{characters[selectedCharacter].id === "wen-fei" ? <div className="q-extra"><img src="/assets/chibi/bai-ling.webp" alt="白令Q版" /><span><b>补录 · 白令</b><small>庄王府暗卫首领，周楹的属下。</small></span></div> : <img src={`/assets/chibi/${characters[selectedCharacter].id}.webp`} alt={`${characters[selectedCharacter].name}Q版`} />}<small className="note">人物关系与身份依据原著；特性仅为游戏化演绎，不改写原著事件。</small></article></div></div></div>}
  </main>;
}

function Meter({ label, value, danger=false }: {label:string,value:number,danger?:boolean}) { return <div className={`meter ${danger?"danger":""}`}><span>{label}<b>{value}</b></span><div><i style={{width:`${value}%`}} /></div></div>; }
