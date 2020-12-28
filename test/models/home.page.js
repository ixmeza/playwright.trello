const BasePage = require("./base.page.js");

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.trello = "span._1q-xxtNvcdFBca";
    this.homeTop = `[aria-label='HouseIcon']`;
    this.boardTop = `button span [aria-label='BoardIcon']`;
    this.boardsLeft = `.icon-board`;
    this.createBoardLink = `[data-test-id='create-board-tile']`;
    this.boardTitleTxt = `input[data-test-id='create-board-title-input']`;
    this.createBoardBtn = `button[data-test-id='create-board-submit-button']`;
    this.downIcon = `[aria-label ='DownIcon']`;
    this.private = `._1vKsXPLDUZ7hbH li:nth-child(1) ._2FCfpANq784raH.LrSeigrVRlrVHb`;
    this.teamBoards = `[data-test-id='home-team-boards-tab']`;
    this.viewClosedBoardsBtn = `.content-all-boards button:nth-child(1)`;
    this.closedBoardsTitle = `//h2[text()='Closed Boards']`;
    this.closedBoards = `div._1rhhEuk7pUqNV_ a`;
  }

  async navigate(username) {
    super.navigate(`${username}/boards`);
  }

  async waitForPageLoaded() {
    await this.page.waitForSelector(this.trello, { state: "visible" });
    await this.page.waitForSelector(this.homeTop, { state: "visible" });
    await this.page.waitForSelector(this.boardTop, { state: "visible" });
    await this.page.waitForSelector(this.createBoardLink, { state: "visible" });
    await this.page.waitForSelector(this.teamBoards, { state: "visible" });
  }
  async goToHome() {
    await this.page.click(this.homeTop);
    await this.page.waitForSelector(this.teamBoards, { state: "visible" });
  }

  async createBoard(boardname) {
    await this.page.click(this.createBoardLink);
    await this.page.fill(this.boardTitleTxt, boardname);
    await this.page.click(this.downIcon);
    await this.page.click(this.private);
    await this.page.click(this.createBoardBtn);
    await this.page.waitForSelector(`input[aria-label='${boardname}']`, {
      state: "attached",
    });
    await this.page.waitForLoadState("load");
  }

  async getActiveBoards() {
    await this.page.click(this.boardsLeft);
    const boards = await this.page.$$(
      `.boards-page-board-section.mod-no-sidebar:nth-child(2) .board-tile-details-name`
    );
    return boards;
  }

  async isBoardPresent(boardname) {
    let isPresent = false;
    const boards = await this.getActiveBoards();
    for (let i = 0; i < boards.length; i++) {
      if ((await boards[i].getAttribute("title")) == boardname) {
        isPresent = true;
        break;
      }
    }
    return isPresent;
  }

  async openBoardInBoards(boardname) {
    await this.page.click(
      `.boards-page-board-section.mod-no-sidebar:nth-child(2) .board-tile-details.is-badged [title='${boardname}']`
    );
    await this.page.waitForSelector(
      `.board-header-btn.mod-board-name.inline-rename-board.js-rename-board h1`
    );
  }

  async getTeamsBoards() {
    await this.page.waitForSelector(this.teamBoards, { state: "visible" });
    await this.page.click(this.teamBoards);
    await this.page.waitForSelector(`//*[text()='Your Team Boards']`);
  }

  async viewClosedBoards() {
    await this.page.waitForSelector(this.viewClosedBoardsBtn, {
      state: "visible",
    });
    await this.page.click(this.viewClosedBoardsBtn);
    await this.page.waitForSelector(this.closedBoardsTitle, {
      state: "visible",
    });
  }

  async getClosedBoards() {
    await this.page.waitForSelector(`//h2[text()='Closed Boards']`, {
      state: "visible",
    });
    await this.page.waitForSelector(`div._1rhhEuk7pUqNV_ a`, {
      state: "attached",
    });
    const closedboards = await this.page.$$(`div._1rhhEuk7pUqNV_ a`);
    return closedboards;
  }
  async isClosedBoardPresent(boardname) {
    let isPresent = false;
    const boards = await this.getClosedBoards();
    for (let i = 0; i < boards.length; i++) {
      if ((await boards[i].innerText()) == boardname) {
        isPresent = true;
        break;
      }
    }
    return isPresent;
  }
  async reOpenBoard(boardname) {
    await this.page.click(
      `//li[@class='_3qs_zRN8-2BLJs']//*[text()='${boardname}']/ancestor::li//button[text()='Re-open']`
    );
    await this.page.waitForSelector(
      `//li[@class='_3qs_zRN8-2BLJs']//*[text()='${boardname}']/ancestor::li//button[text()='Re-open']`,
      { state: "detached" }
    );
  }

  async deleteBoard(boardname) {
    await this.page.click(
      `//li[@class='_3qs_zRN8-2BLJs']//*[text()='${boardname}']/ancestor::li//button[text()='Delete']`
    );
    await this.page.click(`//section//button[text()='Delete']`);
    await this.page.waitForSelector(`//*[text()='Deleting…']`, {
      state: "detached",
    });
  }
}
module.exports = HomePage;
