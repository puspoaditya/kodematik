import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluationEvidence, formatEvaluationEvidence } from '../src/evaluation.js';

test('evaluation evidence exposes per-task stochastic regression diagnostics without instruction content',()=>{
  const result={
    taskId:'abc123',variant:'turn-efficient',score:0,pass:false,usable:true,
    after:[
      {name:'lint',family:'lint',ok:false,status:1,targeted:false},
      {name:'test:vitest:unit',family:'test',ok:false,status:1,targeted:true},
    ],
    files:['lib/fix.js'],testFilesTouched:[],modifiedOracleFiles:[],
    agent:{ok:true,status:0,stderr:'exceeded 8 tool-call turns',instructionContext:{loaded:true,sha256:'1234567890abcdefZZZZZZZZZZZZZZZZ',chars:10736}},
  };
  const evidence=evaluationEvidence(result),line=formatEvaluationEvidence(result);
  assert.equal(evidence.taskId,'abc123');
  assert.equal(evidence.score,0);
  assert.equal(evidence.turnExhausted,true);
  assert.deepEqual(evidence.failedChecks.map(x=>x.name),['lint','test:vitest:unit']);
  assert.deepEqual(evidence.changedFiles,['lib/fix.js']);
  assert.equal(evidence.instructionFingerprint,'1234567890abcdefZZZZZZZZZZZZZZZZ');
  assert.match(line,/\[task-evidence\] abc123 variant=turn-efficient score=0 pass=no/);
  assert.match(line,/failures=lint:1,test:vitest:unit:1/);
  assert.match(line,/files=lib\/fix\.js/);
  assert.match(line,/turns=exhausted/);
  assert.match(line,/instructions=loaded:1234567890abcdef:10736/);
  assert.doesNotMatch(line,/ZZZZZZZZ/);
});
