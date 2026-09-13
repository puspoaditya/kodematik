import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const CANDIDATE_MANIFEST_SCHEMA = 1;

function stableTasks(tasks={}){
  return Object.fromEntries(Object.entries(tasks).sort(([a],[b])=>a.localeCompare(b)).map(([taskId,rules])=>[taskId,[...rules]]));
}

function payload(manifest={}){
  return {
    schemaVersion:CANDIDATE_MANIFEST_SCHEMA,
    targetRepo:manifest.targetRepo||null,
    datasetFingerprint:manifest.datasetFingerprint||null,
    mutation:{id:manifest.mutation?.id||'',title:manifest.mutation?.title||''},
    tasks:stableTasks(manifest.tasks||{}),
  };
}

export function candidateManifestFingerprint(manifest={}){
  return createHash('sha256').update(JSON.stringify(payload(manifest))).digest('hex');
}

export function createCandidateManifest({targetRepo=null,datasetFingerprint=null,mutation,tasks={}}={}){
  const base=payload({targetRepo,datasetFingerprint,mutation,tasks});
  return {...base,fingerprint:candidateManifestFingerprint(base)};
}

export function validateCandidateManifest(manifest,{targetRepo=null,datasetFingerprint=null}={}){
  if(!manifest||manifest.schemaVersion!==CANDIDATE_MANIFEST_SCHEMA)throw new Error(`Unsupported candidate manifest schema: ${manifest?.schemaVersion??'missing'}`);
  if(!manifest.mutation?.id)throw new Error('Candidate manifest is missing mutation.id');
  if(!manifest.tasks||typeof manifest.tasks!=='object'||Array.isArray(manifest.tasks))throw new Error('Candidate manifest tasks must be an object keyed by task ID');
  for(const[taskId,rules]of Object.entries(manifest.tasks)){if(!taskId||!Array.isArray(rules)||rules.some(rule=>typeof rule!=='string'))throw new Error(`Candidate manifest has invalid rules for task ${taskId||'<empty>'}`);}
  const actual=candidateManifestFingerprint(manifest);
  if(manifest.fingerprint!==actual)throw new Error(`Candidate manifest fingerprint mismatch: expected ${manifest.fingerprint||'missing'}, got ${actual}`);
  if(targetRepo&&manifest.targetRepo&&manifest.targetRepo!==targetRepo)throw new Error(`Candidate manifest target mismatch: expected ${targetRepo}, got ${manifest.targetRepo}`);
  if(datasetFingerprint&&manifest.datasetFingerprint&&manifest.datasetFingerprint!==datasetFingerprint)throw new Error(`Candidate manifest dataset mismatch: expected ${datasetFingerprint}, got ${manifest.datasetFingerprint}`);
  return {...payload(manifest),fingerprint:actual};
}

export function readCandidateManifest(path,expected={}){
  const file=resolve(path);
  if(!existsSync(file))throw new Error(`Candidate manifest not found: ${file}`);
  let parsed;try{parsed=JSON.parse(readFileSync(file,'utf8'));}catch(error){throw new Error(`Candidate manifest is not valid JSON: ${error.message}`);}
  return validateCandidateManifest(parsed,expected);
}

export function writeCandidateManifest(path,manifest){
  const file=resolve(path),validated=validateCandidateManifest(manifest);
  mkdirSync(dirname(file),{recursive:true});
  writeFileSync(file,`${JSON.stringify(validated,null,2)}\n`);
  return file;
}
