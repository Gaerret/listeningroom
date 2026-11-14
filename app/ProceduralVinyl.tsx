export default function ProceduralVinyl({ base, label='#e8e2d4', a, b, c, finish='Solid' }: { base:string; label?:string; a:string; b:string; c:string; finish?:string }) {
  const splatter = finish.toLowerCase().includes('splatter');
  const colors=[a,b,c];
  const rad=(n:number)=>n*Math.PI/180;
  const streaks=Array.from({length:78},(_,i)=>{
    const angle=(i*137.5+11)%360, cluster=i%7, start=10+(i%5)*1.1, end=35+((i*19)%150)/10, width=.55+(i%6)*.32, drift=((i*29)%11-5)*.18, col=colors[(i+cluster)%3];
    const x=(r:number,off:number)=>50+Math.cos(rad(angle+off))*r, y=(r:number,off:number)=>50+Math.sin(rad(angle+off))*r;
    const d=`M${x(start,-width)} ${y(start,-width)} L${x(end,-width*.42+drift)} ${y(end,-width*.42+drift)} L${x(end+2,width*.8+drift)} ${y(end+2,width*.8+drift)} L${x(start,width)} ${y(start,width)} Z`;
    return <path key={i} d={d} fill={col} opacity={.58+(i%5)*.07}/>;
  });
  const flecks=Array.from({length:65},(_,i)=>{const angle=(i*71+23)%360,r=20+(i*23)%27,x=50+Math.cos(rad(angle))*r,y=50+Math.sin(rad(angle))*r,s=.35+(i%5)*.28;return <ellipse key={i} cx={x} cy={y} rx={s*2.3} ry={s*.65} fill={colors[i%3]} opacity=".72" transform={`rotate(${angle+35} ${x} ${y})`}/>;});
  const rings=Array.from({length:22},(_,i)=><circle key={i} cx="50" cy="50" r={15+i*1.55} fill="none" stroke="#fff" strokeOpacity={i%3===0?.13:.045} strokeWidth=".22"/>);
  const discBase=splatter?'#171717':base;
  return <svg className="procedural-vinyl" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="vinyl-shine"><stop offset="0" stopColor="#fff" stopOpacity=".2"/><stop offset=".36" stopColor="#fff" stopOpacity=".035"/><stop offset="1" stopColor="#000" stopOpacity=".48"/></radialGradient><filter id="vinyl-noise"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="12"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter></defs><circle cx="50" cy="50" r="49" fill={discBase}/>{splatter&&<>{streaks}{flecks}</>}<circle cx="50" cy="50" r="48.6" fill="url(#vinyl-shine)"/>{rings}<circle cx="50" cy="50" r="48.6" filter="url(#vinyl-noise)" opacity=".32"/><circle cx="50" cy="50" r="14.2" fill={label} stroke="#141414" strokeWidth="2.2"/><circle cx="50" cy="50" r="11.5" fill={label} stroke="#3d3b38" strokeWidth="1.2"/><circle cx="50" cy="50" r="8.8" fill={label}/><circle cx="50" cy="50" r="1.6" fill="#272522"/></svg>;
}
