const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:7071/api';

async function testLoginFlow() {
  console.log('Starting Playwright E2E Test for Login Flow...\n');

  const browser = await chromium.launch({
    headless: false,  // Set to true for CI/CD
    slowMo: 500       // Slow down for visibility
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages from the page
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'info') {
      console.log(`[Browser Console] ${msg.text()}`);
    }
  });

  // Listen for network requests to backend
  page.on('request', request => {
    if (request.url().includes('localhost:7071')) {
      console.log(`[API Request] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('localhost:7071')) {
      console.log(`[API Response] ${response.status()} ${response.url()}`);
    }
  });

  try {
    // Test 1: Navigate to the app
    console.log('\n=== Test 1: Navigate to Login Page ===');
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check if we're on the login page
    const loginTitle = await page.locator('h2.login-title').textContent();
    console.log(`Login page title: ${loginTitle}`);
    console.log('✓ Login page loaded successfully\n');

    // Test 2: Create a new account
    console.log('=== Test 2: Create New Account ===');

    // Click "Create Account" link
    await page.click('button.toggle-link:has-text("Create Account")');
    await page.waitForTimeout(500);

    // Fill in the registration form
    const timestamp = Date.now();
    const testUsername = `testuser_${timestamp}`;
    const testEmail = `test_${timestamp}@example.com`;
    const testPassword = 'TestPass123';

    console.log(`Creating account with email: ${testEmail}`);

    await page.fill('input#username', testUsername);
    await page.fill('input#email', testEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);

    // Take screenshot before submit
    await page.screenshot({ path: 'e2e/screenshots/01-registration-form.png' });
    console.log('Screenshot saved: 01-registration-form.png');

    // Submit the form
    await page.click('button.login-button:has-text("Create Account")');

    // Wait for success message or error
    await page.waitForTimeout(2000);

    // Check for success or error message
    const successMsg = await page.locator('.success-message').textContent().catch(() => null);
    const errorMsg = await page.locator('.error-message').textContent().catch(() => null);

    if (successMsg) {
      console.log(`✓ Registration successful: ${successMsg}`);
    } else if (errorMsg) {
      console.log(`Registration message: ${errorMsg}`);
    }

    await page.screenshot({ path: 'e2e/screenshots/02-registration-result.png' });
    console.log('Screenshot saved: 02-registration-result.png\n');

    // Test 3: Login with the new account
    console.log('=== Test 3: Login with New Account ===');

    // Wait for the form to switch back to login mode
    await page.waitForTimeout(2500);

    // Fill login form (login uses email, not username)
    await page.fill('input#username', testEmail);  // The input id is still 'username' but label shows 'Email'
    await page.fill('input#password', testPassword);

    await page.screenshot({ path: 'e2e/screenshots/03-login-form.png' });
    console.log('Screenshot saved: 03-login-form.png');

    // Submit login
    await page.click('button.login-button:has-text("Log In")');

    // Wait for navigation to main app
    await page.waitForTimeout(3000);

    // Check if we're logged in (look for Hana page elements)
    const isLoggedIn = await page.locator('h1:has-text("Hana")').isVisible().catch(() => false);

    if (isLoggedIn) {
      console.log('✓ Login successful - Hana page visible');
      await page.screenshot({ path: 'e2e/screenshots/04-logged-in.png' });
      console.log('Screenshot saved: 04-logged-in.png\n');
    } else {
      console.log('Login may have failed or page structure different');
      await page.screenshot({ path: 'e2e/screenshots/04-login-result.png' });
    }

    // Test 4: Interact with Hana chat (Find Work mode)
    console.log('=== Test 4: Test Hana Chat - Find Work Mode ===');

    // Make sure we're in "Find Work" mode
    const findWorkButton = page.locator('button.mode-button:has-text("Find Work")');
    if (await findWorkButton.isVisible()) {
      await findWorkButton.click();
      await page.waitForTimeout(500);
    }

    // Switch to Chat mode for easier testing
    const chatOption = page.locator('span.mode-option:has-text("Chat")');
    if (await chatOption.isVisible()) {
      await chatOption.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'e2e/screenshots/05-hana-chat.png' });
    console.log('Screenshot saved: 05-hana-chat.png');

    // Type a message mentioning skills
    const chatInput = page.locator('textarea, input[type="text"]').last();
    if (await chatInput.isVisible()) {
      await chatInput.fill('My name is John and I can do dog walking and house cleaning');
      await page.screenshot({ path: 'e2e/screenshots/06-chat-input.png' });

      // Submit the message (press Enter or click send button)
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'e2e/screenshots/07-chat-response.png' });
      console.log('Screenshot saved: 07-chat-response.png');
      console.log('✓ Chat message sent\n');
    }

    // Test 5: Check for detected skills
    console.log('=== Test 5: Check Detected Skills ===');
    await page.waitForTimeout(2000);

    const skillTags = await page.locator('.skill-tag').allTextContents().catch(() => []);
    if (skillTags.length > 0) {
      console.log(`✓ Detected skills: ${skillTags.join(', ')}`);
    } else {
      console.log('No skills detected yet (may need more conversation)');
    }

    await page.screenshot({ path: 'e2e/screenshots/08-final-state.png' });
    console.log('Screenshot saved: 08-final-state.png\n');

    // Summary
    console.log('=== Test Summary ===');
    console.log('✓ Login page loaded');
    console.log('✓ Registration form submitted');
    console.log('✓ Login attempted');
    console.log('✓ Hana chat interaction tested');
    console.log('\nCheck e2e/screenshots/ folder for visual results');
    console.log('Check backend logs for API calls\n');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'e2e/screenshots/error.png' });
  } finally {
    // Keep browser open for 5 seconds to see final state
    console.log('Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Run the test
testLoginFlow().catch(console.error);
