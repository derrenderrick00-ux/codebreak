import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {pool} from './db.js';
const file=fileURLToPath(new URL('../sql/001_initial.sql',import.meta.url));
const sql=await readFile(file,'utf8');
try{await pool.query(sql);console.log('Capstone database migration successful.');}
catch(error){console.error('Migration failed:',error.message);process.exitCode=1;}
finally{await pool.end();}
