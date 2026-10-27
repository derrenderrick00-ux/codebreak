/**
 * Byte-size regression guard for the Vite build. This is not an FPS/memory test.
 * We accept Phaser as a lazily loaded chunk but keep the initial JS small.
 */
import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';

export const budget={initialJS:180_000,totalJS:1_600_000,css:150_000,initialGzip:75_000};
export function assessAssets(assets, limits=budget) {
  const javascript=assets.filter(x=>x.name.endsWith('.js'));
  const css=assets.filter(x=>x.name.endsWith('.css'));
  const initial=javascript.filter(x=>/^index[-.]/.test(x.name));
  const entryBytes=initial.reduce((sum,x)=>sum+x.bytes,0);
  const entryGzip=initial.reduce((sum,x)=>sum+x.gzip,0);
  const totalBytes=javascript.reduce((sum,x)=>sum+x.bytes,0);
  const cssBytes=css.reduce((sum,x)=>sum+x.bytes,0);
  const warnings=[];
  if (!initial.length)warnings.push('No Vite index JS entry found');
  if (entryBytes>limits.initialJS)warnings.push(`Initial JavaScript ${entryBytes} > ${limits.initialJS} bytes`);
  if (entryGzip>limits.initialGzip)warnings.push(`Initial JS gzip ${entryGzip} > ${limits.initialGzip} bytes`);
  if (totalBytes>limits.totalJS)warnings.push(`Total JavaScript ${totalBytes} > ${limits.totalJS} bytes`);
  if (cssBytes>limits.css)warnings.push(`CSS ${cssBytes} > ${limits.css} bytes`);
  return {entryBytes,entryGzip,totalBytes,cssBytes,passed:warnings.length===0,warnings};
}

export function inspectDir(dir) {
  const entries=readdirSync(dir,{withFileTypes:true}).filter(x=>x.isFile()&&/\.(css|js)$/.test(x.name));
  return entries.map(x=>{const buf=readFileSync(join(dir,x.name));return {name:x.name,bytes:buf.length,gzip:gzipSync(buf).length};});
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const target=resolve(process.argv[2]??'dist/assets');
    const result=assessAssets(inspectDir(target));
    console.log('CodeBreak bundle-size budget (bytes; not a performance benchmark)');
    console.table({initialJS:result.entryBytes,initialGzip:result.entryGzip,totalJS:result.totalBytes,css:result.cssBytes});
    for(const warning of result.warnings)console.error('FAIL',warning);
    if(!result.passed)process.exitCode=1;
    else console.log('PASS: size budgets met. Continue browser/FPS tests separately.');
  }catch(error){console.error(`Bundle budget cannot run: ${error.message}`);process.exitCode=1;}
}
