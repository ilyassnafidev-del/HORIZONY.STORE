import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {products} from '../lib/catalog.ts';
test('all 63 distinct original photographs and responsive WebP variants exist',()=>{
  const names=readdirSync('public/images').filter(name=>name.endsWith('.webp'));
  assert.equal(names.length,189,'63 original photographs with 400px and 800px variants');
  const hashes=new Set<string>();
  for(const product of products){for(const image of product.images){
    for(const suffix of ['', '-400','-800']){
      const filename=`public${image.replace('.webp',`${suffix}.webp`)}`;
      const bytes=readFileSync(filename);
      assert.equal(bytes.toString('ascii',0,4),'RIFF',filename);
      assert.equal(bytes.toString('ascii',8,12),'WEBP',filename);
      if(suffix==='')hashes.add(createHash('sha256').update(bytes).digest('hex'));
    }
  }}
  assert.equal(hashes.size,63,'Each product angle must be a distinct photograph');
});
