'use client';
import { useState } from 'react';

type Props = { color: string; finish?: string; onApply: (value: { color: string; finish: string; splatterA: string; splatterB: string; splatterC: string }) => void; onClose: () => void };

export default function VinylDesigner({ color, finish = 'Splatter', onApply, onClose }: Props) {
  const [base, setBase] = useState(color); const [a, setA] = useState('#e43b25'); const [b, setB] = useState('#ff9f1c'); const [c, setC] = useState('#111111');
  return <div className="vinyl-designer" role="dialog" aria-modal="true" aria-label="Vinyl designer"><div className="vinyl-designer-panel"><div className="vinyl-designer-head"><div><span className="eyebrow">VINYL PRESSING DESIGNER</span><h2>Build the pressing</h2></div><button type="button" onClick={onClose}>×</button></div><div className="designer-preview"><div className="designer-disc" style={{'--disc':base,'--a':a,'--b':b,'--c':c} as React.CSSProperties}/></div><div className="designer-controls"><label>Base color<input type="color" value={base} onChange={e=>setBase(e.target.value)}/></label><label>Splatter 1<input type="color" value={a} onChange={e=>setA(e.target.value)}/></label><label>Splatter 2<input type="color" value={b} onChange={e=>setB(e.target.value)}/></label><label>Splatter 3<input type="color" value={c} onChange={e=>setC(e.target.value)}/></label></div><div className="dialog-actions"><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={()=>onApply({color:base,finish,splatterA:a,splatterB:b,splatterC:c})}>Apply design</button></div></div></div>;
}
