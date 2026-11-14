export default function ProceduralVinyl({ base, a, b, c, finish='Solid' }: { base:string; a:string; b:string; c:string; finish?:string }) {
  const splatter = finish.toLowerCase().includes('splatter');
  const colors=[a,b,c];
  const strokes = Array.from({length: 30}, (_, i) => {
    const angle=(i*53+17)%360, inner=9+(i%6)*2, outer=40+(i%7), wi=1.5+(i%5)*1.35, wo=wi*(.45+(i%3)*.16), color=colors[i%3];
    const d=`M50 ${50-inner} C${50-wi} ${50-inner-4} ${50-wo} ${50-outer+7} ${50-wo*.45} ${50-outer} L${50+wo*1.25} ${50-outer+((i%3)-1)*1.2} C${50+wo} ${50-outer+8} ${50+wi} ${50-inner+3} ${50} ${50-inner+((i%4)-2)*.8} Z`;
    return <path key={i} d={d} transform={`rotate(${angle} 50 50)`} fill={color} opacity={.65+(i%4)*.07}/>;
  });
  const flecks = Array.from({length:42},(_,i) => { const angle=(i*83+29)%360, r=18+(i*17)%29, x=50+Math.cos(angle*Math.PI/180)*r, y=50+Math.sin(angle*Math.PI/180)*r, size=.45+(i%4)*.42; return <ellipse key={i} cx={x} cy={y} rx={size*1.7} ry={size*.65} fill={colors[(i+1)%3]} opacity=".7" transform={`rotate(${angle+35} ${x} ${y})`}/>; });
  const rings=Array.from({length:18},(_,i)=><circle key={i} cx="50" cy="50" r={15+i*1.85} fill="none" stroke="#fff" strokeOpacity={i%3===0?.12:.055} strokeWidth=".22"/>);
  return <svg className="procedural-vinyl" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="vinyl-shine"><stop offset="0" stopColor="#fff" stopOpacity=".22"/><stop offset=".38" stopColor="#fff" stopOpacity=".04"/><stop offset="1" stopColor="#000" stopOpacity=".38"/></radialGradient><filter id="vinyl-noise"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="8"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter></defs><circle cx="50" cy="50" r="49" fill={base}/>{splatter&&<>{strokes}{flecks}</>}<circle cx="50" cy="50" r="48.5" fill="url(#vinyl-shine)"/>{rings}<circle cx="50" cy="50" r="48.5" filter="url(#vinyl-noise)" opacity=".35"/><circle cx="50" cy="50" r="12.6" fill="#d8d0bd" stroke="#171717" strokeWidth="2"/><circle cx="50" cy="50" r="9.4" fill="#514b42"/><text x="50" y="51.5" textAnchor="middle" fontSize="3.1" fontFamily="Arial" fontWeight="700" fill="#eee7d7">VINYL</text></svg>;
}
