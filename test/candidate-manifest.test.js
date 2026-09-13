import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createCandidateManifest, candidateManifestFingerprint, readCandidateManifest, validateCandidateManifest, writeCandidateManifest } from '../src/candidate-manifest.js';
import { mutationFromCandidateManifest } from '../src/mutations.js';

test('candidate manifest fingerprint is stable across task key order',()=>{
  const a=createCandidateManifest({targetRepo:'axios/axios',datasetFingerprint:'abc',mutation:{id:'turn-efficient',title:'Turn-efficient verification'},tasks:{b:['two'],a:['one']}});
  const b=createCandidateManifest({targetRepo:'axios/axios',datasetFingerprint:'abc',mutation:{id:'turn-efficient',title:'Turn-efficient verification'},tasks:{a:['one'],b:['two']}});
  assert.equal(a.fingerprint,b.fingerprint);
  assert.equal(candidateManifestFingerprint(a),a.fingerprint);
});

test('candidate manifest rejects tampering and dataset mismatch',()=>{
  const manifest=createCandidateManifest({targetRepo:'axios/axios',datasetFingerprint:'locked',mutation:{id:'turn-efficient',title:'Turn-efficient verification'},tasks:{task1:['exact rule']}});
  assert.throws(()=>validateCandidateManifest({...manifest,tasks:{task1:['changed rule']}},{targetRepo:'axios/axios',datasetFingerprint:'locked'}),/fingerprint mismatch/);
  assert.throws(()=>validateCandidateManifest(manifest,{targetRepo:'axios/axios',datasetFingerprint:'different'}),/dataset mismatch/);
});

test('candidate manifest round-trips exact rules',()=>{
  const dir=mkdtempSync(join(tmpdir(),'kodematik-manifest-')),path=join(dir,'candidate.json');
  const manifest=createCandidateManifest({targetRepo:'axios/axios',datasetFingerprint:'locked',mutation:{id:'turn-efficient',title:'Turn-efficient verification'},tasks:{task1:['Rule A','Rule B']}});
  writeCandidateManifest(path,manifest);
  const loaded=readCandidateManifest(path,{targetRepo:'axios/axios',datasetFingerprint:'locked'});
  assert.deepEqual(loaded.tasks.task1,['Rule A','Rule B']);
  assert.match(readFileSync(path,'utf8'),/"fingerprint"/);
});

test('manifest replay uses exact frozen rules and fails closed on unknown task',()=>{
  const dir=mkdtempSync(join(tmpdir(),'kodematik-replay-'));
  const manifest=createCandidateManifest({targetRepo:'axios/axios',datasetFingerprint:'locked',mutation:{id:'turn-efficient',title:'Turn-efficient verification'},tasks:{task1:['Exact replay rule']}});
  const mutation=mutationFromCandidateManifest(manifest),info={scripts:{}};
  mutation.apply(dir,info,{task:{id:'task1'}});
  assert.match(readFileSync(join(dir,'AGENTS.md'),'utf8'),/Exact replay rule/);
  assert.throws(()=>mutation.apply(dir,info,{task:{id:'task2'}}),/missing task task2/);
});
