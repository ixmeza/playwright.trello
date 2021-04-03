const BasePage = require("./base.page.js");

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.username = "input#user";
    this.password = "input#password";
    this.loginAtlassian = "input#login";
    this.loginBtn = "#login-submit";
  }

  async navigate() {
    super.navigate("login");
  }

  async login(user, pwd) {
    await this.page.fill(this.username, user);
    await this.page.click(this.loginAtlassian);
    await this.page.waitForLoadState("networkidle");
    console.log(await this.page.screenshot({ path: 'screenshot.png', fullPage: true }));
    // it redirects to atlasian login
    await this.page.fill(this.password, pwd);
    await this.page.click(this.loginBtn);
    await this.page.waitForSelector(`[aria-label='HouseIcon']`);
    await this.page.waitForLoadState("load");
  }
}
module.exports = LoginPage;
