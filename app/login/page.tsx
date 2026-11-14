'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState('');
  async function submit(e:FormEvent){e.preventDefault();setError('');const r=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});if(!r.ok){setError('Неверный email или пароль');return;}router.push('/');router.refresh();}
  return <main className="login-page"><form onSubmit={submit}><h1>The Listening Room</h1><p>Войдите, чтобы открыть коллекцию.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Пароль<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button className="primary" type="submit">Войти</button></form></main>;
}
