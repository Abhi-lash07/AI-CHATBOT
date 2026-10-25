// Test script to verify test cases A, B, C, D, E against /api/chat

async function runTests() {
  console.log('--- STARTING IMAGE UNDERSTANDING TEST SUITE ---');

  // Test Case A: Oracle Certification Badge with "Explain"
  console.log('\n[TEST A] Upload Oracle Certification Badge and type "Explain":');
  const resA = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Explain',
          files: [
            {
              name: 'oracle-cloud-infrastructure-ai-foundations-badge.png',
              type: 'image/png',
              // 1x1 transparent png for test transport
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          ],
        },
      ],
    }),
  });

  const textA = await resA.text();
  console.log('Result for Test A contains Oracle?:', textA.includes('Oracle'));
  console.log('Does Test A avoid Quantum?:', !textA.includes('Quantum'));

  // Test Case B: Mathematical Problem with "Solve step by step"
  console.log('\n[TEST B] Upload Math Equation and type "Solve step by step":');
  const resB = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Solve step by step',
          files: [
            {
              name: 'math-linear-equation.png',
              type: 'image/png',
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          ],
        },
      ],
    }),
  });
  const textB = await resB.text();
  console.log('Result for Test B contains Mathematical / Solve?:', textB.includes('Mathematical') || textB.includes('Solution') || textB.includes('Equation'));

  // Test Case C: Flowchart with "Explain this diagram"
  console.log('\n[TEST C] Upload Flowchart and type "Explain this diagram":');
  const resC = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Explain this diagram',
          files: [
            {
              name: 'system-flowchart.png',
              type: 'image/png',
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          ],
        },
      ],
    }),
  });
  const textC = await resC.text();
  console.log('Result for Test C contains Diagram / Flowchart?:', textC.includes('Diagram') || textC.includes('Flowchart') || textC.includes('Process'));

  // Test Case D: Text-only message without an image
  console.log('\n[TEST D] Text-only message without an image:');
  const resD = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Explain quantum computing in simple terms',
        },
      ],
    }),
  });
  const textD = await resD.text();
  console.log('Result for Test D answered normally?:', textD.includes('Quantum'));

  // Test Case E: Multi-turn follow-up with preserved image context
  console.log('\n[TEST E] Multi-turn follow-up question maintaining image context:');
  const resE = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Explain',
          files: [
            {
              name: 'oracle-ai-badge.png',
              type: 'image/png',
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          ],
        },
        {
          role: 'model',
          content: 'This is the Oracle Cloud Infrastructure AI Foundations Associate badge.',
        },
        {
          role: 'user',
          content: 'What career paths does this certification help with?',
        },
      ],
    }),
  });
  const textE = await resE.text();
  console.log('Result for Test E preserves Oracle badge context?:', textE.includes('Oracle') || textE.includes('Certification') || textE.includes('image'));

  console.log('\n--- ALL TEST SUITE CHECKS COMPLETED ---');
}

runTests().catch(console.error);
