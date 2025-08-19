import { expect, test } from '@playwright/test'
import { environment } from '../../../src/config/environment'
import { LoginPage } from '../../../src/pages/LoginPage'

/**
 * Simple Login Test Suite (without database)
 * Tests basic login functionality using Page Object Model
 */
test.describe('Simple Login Tests', () => {
  let loginPage: LoginPage

  // Setup before each test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)

    // Navigate to login page
    await loginPage.navigateToLoginPage()

    // Validate login page is loaded
    await loginPage.validateLoginPageLoaded()
  })

  test('should successfully login with valid credentials', async () => {
    // Act - Perform login with hardcoded valid credentials
    await loginPage.login(environment.test.username, environment.test.password)

    // Assert - Verify successful login
    await loginPage.validateSuccessfulLogin()

    // Additional assertions
    const isLoginSuccessful = await loginPage.isLoginSuccessful()
    expect(isLoginSuccessful).toBe(true)

    const successMessage = await loginPage.getSuccessMessage()
    expect(successMessage).toContain('Logged In Successfully')

    const isLogoutButtonVisible = await loginPage.isLogoutButtonVisible()
    expect(isLogoutButtonVisible).toBe(true)
  })

  test('should fail login with invalid credentials', async () => {
    // Act - Perform login with hardcoded invalid credentials
    await loginPage.login('invalid_user', 'invalid_password')

    // Assert - Verify failed login
    await loginPage.validateFailedLogin()
  })
})
