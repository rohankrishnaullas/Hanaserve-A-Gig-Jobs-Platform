const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:7071/api';

async function testMatchingFlow() {
  console.log('Starting Playwright E2E Test for Job Matching Flow...\n');
  console.log('Scenario: Provider registers FIRST with delivery skills,');
  console.log('then Requester posts a bike service pickup job and matching occurs.\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const timestamp = Date.now();

  // User A - Job Requester (will create job SECOND)
  const userA = {
    username: `requester_${timestamp}`,
    email: `requester_${timestamp}@example.com`,
    password: 'TestPass123'
  };

  // User B - Service Provider (will register FIRST)
  const userB = {
    username: `provider_${timestamp}`,
    email: `provider_${timestamp}@example.com`,
    password: 'TestPass123'
  };

  let userAToken = null;
  let userBToken = null;
  let createdJobId = null;
  let providerIdB = null;

  try {
    // ============================================================
    // PART 1: User B - Register as Provider with Delivery Skills FIRST
    // ============================================================
    console.log('='.repeat(60));
    console.log('PART 1: User B - Registering as Provider with Delivery Skills');
    console.log('='.repeat(60));

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    pageB.on('request', request => {
      if (request.url().includes('localhost:7071')) {
        console.log(`[User B API] ${request.method()} ${request.url()}`);
      }
    });
    pageB.on('response', response => {
      if (response.url().includes('localhost:7071')) {
        console.log(`[User B Response] ${response.status()} ${response.url()}`);
      }
    });

    // Step 1.1: Register User B
    console.log('\n--- Step 1.1: Register User B ---');
    await pageB.goto(FRONTEND_URL);
    await pageB.waitForLoadState('networkidle');

    await pageB.click('button.toggle-link:has-text("Create Account")');
    await pageB.waitForTimeout(500);

    await pageB.fill('input#username', userB.username);
    await pageB.fill('input#email', userB.email);
    await pageB.fill('input#password', userB.password);
    await pageB.fill('input#confirmPassword', userB.password);

    await pageB.screenshot({ path: 'e2e/screenshots/match-01-providerB-register.png' });
    await pageB.click('button.login-button:has-text("Create Account")');
    await pageB.waitForTimeout(2500);
    console.log(`✓ User B registered: ${userB.email}`);

    // Step 1.2: Login User B
    console.log('\n--- Step 1.2: Login User B ---');
    await pageB.fill('input#username', userB.email);
    await pageB.fill('input#password', userB.password);
    await pageB.click('button.login-button:has-text("Log In")');
    await pageB.waitForTimeout(3000);
    console.log('✓ User B logged in');

    await pageB.screenshot({ path: 'e2e/screenshots/match-02-providerB-loggedin.png' });

    // Step 1.3: Switch to Find Work + Chat mode
    console.log('\n--- Step 1.3: Switch to Find Work + Chat mode ---');

    const findWorkBtn = pageB.locator('button.mode-button:has-text("Find Work")');
    if (await findWorkBtn.isVisible()) {
      await findWorkBtn.click();
      await pageB.waitForTimeout(500);
    }

    const chatOptB = pageB.locator('span.mode-option:has-text("Chat")');
    if (await chatOptB.isVisible()) {
      await chatOptB.click();
      await pageB.waitForTimeout(1000);
    }

    await pageB.screenshot({ path: 'e2e/screenshots/match-03-providerB-findwork.png' });

    // Step 1.4: User B mentions delivery skills via chat
    console.log('\n--- Step 1.4: User B mentions delivery/pickup skills ---');
    await pageB.waitForTimeout(2000);

    const chatInputB = pageB.locator('textarea, input[type="text"]').last();
    if (await chatInputB.isVisible()) {
      await chatInputB.fill('Hi, I can help with delivery and pickup services. I have experience with courier and transport jobs.');
      await pageB.screenshot({ path: 'e2e/screenshots/match-04-providerB-skills.png' });
      await chatInputB.press('Enter');
      await pageB.waitForTimeout(3000);
      console.log('✓ Skills message sent');
    }

    await pageB.screenshot({ path: 'e2e/screenshots/match-05-providerB-chat.png' });

    // Step 1.5: Create provider profile via API
    console.log('\n--- Step 1.5: Create Provider Profile via API ---');
    userBToken = await pageB.evaluate(() => localStorage.getItem('accessToken'));

    if (userBToken) {
      const providerResponse = await fetch(`${BACKEND_URL}/providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userBToken}`
        },
        body: JSON.stringify({
          name: userB.username,
          skills: ['delivery', 'pickup', 'transport', 'courier'],
          bio: 'I provide delivery and pickup services. Have my own bike for quick transport.',
          hourlyRate: 20,
          latitude: 37.7849,
          longitude: -122.4094,
          city: 'San Francisco'
        })
      });

      const providerData = await providerResponse.json();
      if (providerData.success && providerData.data) {
        providerIdB = providerData.data.id;
        console.log(`✓ Provider profile created! ID: ${providerIdB}`);
        console.log(`  Skills: ${providerData.data.skills?.join(', ')}`);
        console.log(`  Categories: ${providerData.data.skillCategories?.join(', ')}`);
      } else {
        console.log('Provider response:', JSON.stringify(providerData, null, 2));
      }
    }

    // ============================================================
    // PART 2: User A - Register and Create Job Request SECOND
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('PART 2: User A - Creating Job Request (matching will find User B)');
    console.log('='.repeat(60));

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    pageA.on('request', request => {
      if (request.url().includes('localhost:7071')) {
        console.log(`[User A API] ${request.method()} ${request.url()}`);
      }
    });
    pageA.on('response', response => {
      if (response.url().includes('localhost:7071')) {
        console.log(`[User A Response] ${response.status()} ${response.url()}`);
      }
    });

    // Step 2.1: Register User A
    console.log('\n--- Step 2.1: Register User A ---');
    await pageA.goto(FRONTEND_URL);
    await pageA.waitForLoadState('networkidle');

    await pageA.click('button.toggle-link:has-text("Create Account")');
    await pageA.waitForTimeout(500);

    await pageA.fill('input#username', userA.username);
    await pageA.fill('input#email', userA.email);
    await pageA.fill('input#password', userA.password);
    await pageA.fill('input#confirmPassword', userA.password);

    await pageA.screenshot({ path: 'e2e/screenshots/match-06-requesterA-register.png' });
    await pageA.click('button.login-button:has-text("Create Account")');
    await pageA.waitForTimeout(2500);
    console.log(`✓ User A registered: ${userA.email}`);

    // Step 2.2: Login User A
    console.log('\n--- Step 2.2: Login User A ---');
    await pageA.fill('input#username', userA.email);
    await pageA.fill('input#password', userA.password);
    await pageA.click('button.login-button:has-text("Log In")');
    await pageA.waitForTimeout(3000);
    console.log('✓ User A logged in');

    await pageA.screenshot({ path: 'e2e/screenshots/match-07-requesterA-loggedin.png' });

    // Step 2.3: Switch to Hire Help + Chat mode
    console.log('\n--- Step 2.3: Switch to Hire Help + Chat mode ---');

    const hireHelpBtn = pageA.locator('button.mode-button:has-text("Hire Help")');
    if (await hireHelpBtn.isVisible()) {
      await hireHelpBtn.click();
      await pageA.waitForTimeout(500);
    }

    const chatOptA = pageA.locator('span.mode-option:has-text("Chat")');
    if (await chatOptA.isVisible()) {
      await chatOptA.click();
      await pageA.waitForTimeout(1000);
    }

    await pageA.screenshot({ path: 'e2e/screenshots/match-08-requesterA-hirehelp.png' });

    // Step 2.4: User A describes the bike service job via chat
    console.log('\n--- Step 2.4: User A describes bike service pickup job ---');
    await pageA.waitForTimeout(2000);

    const chatInputA = pageA.locator('textarea, input[type="text"]').last();
    if (await chatInputA.isVisible()) {
      await chatInputA.fill('I need help with bike service pickup and drop. My bike needs to be picked up from home and dropped at the service center.');
      await pageA.screenshot({ path: 'e2e/screenshots/match-09-requesterA-jobdesc.png' });
      await chatInputA.press('Enter');
      await pageA.waitForTimeout(3000);
      console.log('✓ Job description sent');
    }

    await pageA.screenshot({ path: 'e2e/screenshots/match-10-requesterA-chat.png' });

    // Step 2.5: Create job via API (this triggers matching!)
    console.log('\n--- Step 2.5: Create Job via API (triggers matching) ---');
    userAToken = await pageA.evaluate(() => localStorage.getItem('accessToken'));

    if (userAToken) {
      const jobResponse = await fetch(`${BACKEND_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
          title: 'Bike Service Pickup and Drop',
          description: 'Need someone to pick up my bike from home and drop it at the service center. Will need pickup after service is done too.',
          skills: ['delivery', 'pickup', 'transport'],
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St, San Francisco',
          city: 'San Francisco',
          estimatedDuration: 2
        })
      });

      const jobData = await jobResponse.json();
      if (jobData.success && jobData.data) {
        createdJobId = jobData.data.id;
        console.log(`✓ Job created! ID: ${createdJobId}`);
        console.log(`  Title: ${jobData.data.title}`);
        console.log(`  Skills: ${jobData.data.skills?.join(', ')}`);
        console.log(`  Categories: ${jobData.data.skillCategories?.join(', ')}`);
      } else {
        console.log('Job response:', JSON.stringify(jobData, null, 2));
      }
    }

    // Wait for async matching to complete
    console.log('\nWaiting 3 seconds for matching algorithm...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // ============================================================
    // PART 3: Check Matches for User B
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('PART 3: Checking Matches for Provider (User B)');
    console.log('='.repeat(60));

    if (userBToken && providerIdB) {
      console.log('\n--- Step 3.1: Get Matches for User B ---');

      const matchesResponse = await fetch(`${BACKEND_URL}/providers/${providerIdB}/matches`, {
        headers: {
          'Authorization': `Bearer ${userBToken}`
        }
      });

      const matchesData = await matchesResponse.json();
      console.log('\nMatches Response:');
      console.log(JSON.stringify(matchesData, null, 2));

      if (matchesData.success && matchesData.data && matchesData.data.length > 0) {
        console.log(`\n${'*'.repeat(50)}`);
        console.log(`  SUCCESS! Found ${matchesData.data.length} match(es)!`);
        console.log(`${'*'.repeat(50)}`);

        matchesData.data.forEach((match, idx) => {
          console.log(`\nMatch ${idx + 1}:`);
          console.log(`  Job: ${match.jobTitle}`);
          console.log(`  Match Score: ${(match.matchScore * 100).toFixed(1)}%`);
          console.log(`  Distance: ${match.distance?.toFixed(2)} km`);
          console.log(`  Status: ${match.status}`);
          console.log(`  Skill Score: ${(match.skillScore * 100).toFixed(1)}%`);
          console.log(`  Distance Score: ${(match.distanceScore * 100).toFixed(1)}%`);
        });
      } else {
        console.log('\n⚠ No matches found. Possible reasons:');
        console.log('  - Provider skill categories may not match job skill categories');
        console.log('  - Distance may be > 10km');
        console.log('  - Matching may have failed');
      }
    }

    // Step 3.2: Navigate to Matches in UI
    console.log('\n--- Step 3.2: Check Matches page in UI for User B ---');
    const matchesNav = pageB.locator('text=Matches').first();
    if (await matchesNav.isVisible()) {
      await matchesNav.click();
      await pageB.waitForTimeout(2000);
      console.log('✓ Navigated to Matches page');
    }

    await pageB.screenshot({ path: 'e2e/screenshots/match-11-providerB-matches.png' });

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✓ Provider (User B): ${userB.email}`);
    console.log(`  Provider ID: ${providerIdB}`);
    console.log(`\n✓ Requester (User A): ${userA.email}`);
    console.log(`  Job ID: ${createdJobId}`);
    console.log(`\nScreenshots saved to: e2e/screenshots/match-*.png`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\nKeeping browser open for 10 seconds to review...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

testMatchingFlow().catch(console.error);
