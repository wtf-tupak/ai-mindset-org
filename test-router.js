#!/usr/bin/env node
/**
 * Test script for Agent Router integration
 * Verifies the full routing pipeline without starting the Telegram bot
 */

const path = require('path');
const AgentRegistry = require('./openclaw/agents/registry');
const AgentRouter = require('./openclaw/agents/router');

// Mock callAI function
const mockCallAI = async (messages, maxTokens) => {
  const lastMessage = messages[messages.length - 1].content;

  // Simple mock: extract agent name from classification prompt
  if (lastMessage.includes('Classify this user request')) {
    // Parse the user request from the prompt
    const requestMatch = lastMessage.match(/User request: "(.+?)"/);
    if (requestMatch) {
      const request = requestMatch[1].toLowerCase();

      // Simple keyword matching for demo
      if (request.includes('переводчик') || request.includes('translator')) {
        return JSON.stringify({ agent: 'vendor-manager', confidence: 0.8 });
      }
      if (request.includes('счастье') || request.includes('happiness')) {
        return JSON.stringify({ agent: 'none', confidence: 0 });
      }
    }
  }

  return JSON.stringify({ agent: 'none', confidence: 0 });
};

async function main() {
  console.log('=== Agent Router Integration Test ===\n');

  // Initialize registry and router
  const registry = new AgentRegistry();
  const router = new AgentRouter(registry, mockCallAI);

  // Load agents
  const projectRoot = path.join(__dirname);
  await registry.loadFromDirectory(path.join(projectRoot, 'agents'), projectRoot);

  const status = registry.getStatus();
  console.log(`✅ Loaded ${status.total} agents\n`);

  // Test cases
  const testCases = [
    {
      message: 'Сделай SEO-аудит для стоматологической клиники',
      expected: 'marketing-strategist',
      expectedMethod: 'trigger'
    },
    {
      message: 'Напиши пост про email-маркетинг',
      expected: 'prompt-architect',
      expectedMethod: 'trigger'
    },
    {
      message: 'Найди переводчика с английского на русский',
      expected: 'vendor-manager',
      expectedMethod: 'llm'
    },
    {
      message: 'Проанализируй бизнес-процесс закупок',
      expected: 'business-analyst',
      expectedMethod: 'trigger'
    },
    {
      message: 'Что такое счастье?',
      expected: null,
      expectedMethod: null
    }
  ];

  console.log('=== Running Test Cases ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`Test: "${test.message}"`);

    const result = await router.route(test.message);

    if (test.expected === null) {
      // Expect no match
      if (result === null) {
        console.log('  ✅ PASS: No agent match (fallback to manager)');
        passed++;
      } else {
        console.log(`  ❌ FAIL: Expected no match, got ${result.agent.name}`);
        failed++;
      }
    } else {
      // Expect specific agent
      if (result && result.agent.name === test.expected) {
        console.log(`  ✅ PASS: Routed to ${result.agent.name} (method: ${result.method})`);
        passed++;
      } else {
        console.log(`  ❌ FAIL: Expected ${test.expected}, got ${result ? result.agent.name : 'null'}`);
        failed++;
      }
    }
    console.log('');
  }

  console.log('=== Test Summary ===');
  console.log(`Passed: ${passed}/${testCases.length}`);
  console.log(`Failed: ${failed}/${testCases.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
