import test from 'node:test';
import assert from 'node:assert/strict';
import { validRecords } from '../lib/records.ts';
const record = {id:'test',title:'Blue',artist:'Artist',year:1971,genre:'Jazz',status:'collection',color:'#abcdef',notes:''};
test('backup accepts collection, wishlist and an empty shelf',()=>{assert.ok(validRecords([record,{...record,id:'wish',status:'wishlist'}]));assert.ok(validRecords([]));});
test('backup rejects malformed data and duplicate ids',()=>{for(const value of [null,{},[record,record],[{...record,id:''}],[{...record,title:' '}],[{...record,year:NaN}],[{...record,year:1800}],[{...record,genre:'invalid'}],[{...record,status:'sold'}],[{...record,color:'url(example)'}],[{...record,notes:1}]])assert.equal(validRecords(value),false);});
test('backup rejects oversized fields and record sets',()=>{assert.equal(validRecords([{...record,title:'a'.repeat(161)}]),false);assert.equal(validRecords([{...record,notes:'a'.repeat(2001)}]),false);assert.equal(validRecords(Array.from({length:10001},(_,i)=>({...record,id:String(i)}))),false);});
