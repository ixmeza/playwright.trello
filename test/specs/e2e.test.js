const { chromium } = require("playwright");
const { expect, assert, use } = require("chai");
const LoginPage = require("../models/login.page.js");
const HomePage = require("../models/home.page");
const BoardPage = require("../models/board.page.js");
const testConfig = require("../../config.json");

describe("Automation tests for trello using playwright", () => {
  let browser, page, login, home, board, username;

  before(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    login = new LoginPage(page);
    home = new HomePage(page);
    board = new BoardPage(page);
    username = testConfig.username;
    await login.navigate();
    await login.login(testConfig.email, testConfig.password);
  });

  after(async () => {
    await page.close();
    await browser.close();
  });

  afterEach(async () => {
    await home.navigate(username);
  });

  beforeEach(async () => {
    await home.waitForPageLoaded();
  });

  it("Should be able to create a new board", async () => {
    const boardname = "playwright";

    await home.createBoard(boardname);
    // verifying the board name on the page that we are redirected post creation
    const value = await page.getAttribute(
      `input[aria-label='${boardname}']`,
      "value"
    );
    assert(value === boardname);
    await home.goToHome();

    //creating an extra board for demo purposes
    await home.createBoard("cypress");
    await page.getAttribute(`input[aria-label='cypress']`, "value");
    await home.goToHome();

    await home.createBoard("dummy");
    await page.getAttribute(`input[aria-label='dummy']`, "value");
  });

  it("Should be able to close a board", async () => {
    const boardname = "playwright";

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();

    // opening board
    await home.openBoardInBoards(boardname);
    // closing board
    await board.closeBoard();
    // going back to home
    await home.goToHome();
    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();

    // asserting board is no longer present after being closed
    const isPresent = await home.isBoardPresent(boardname);
    assert(isPresent === false);

    //closing another board for demo
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards("cypress");
    // closing board
    await board.closeBoard();

    await home.goToHome();
     //closing another board for demo
     await home.getTeamsBoards();
     // opening board
     await home.openBoardInBoards("dummy");
     // closing board
     await board.closeBoard();

  });

  it("Should be able to reopen a closed board", async () => {
    const boardname = "playwright";
    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // navigating to closed boards
    await home.viewClosedBoards();
    // checking board presence in list
    const isPresent = await home.isClosedBoardPresent(boardname);
    assert(isPresent == true);
    // re-opening board
    await home.reOpenBoard(boardname);
    // checking board presence in list
    assert((await home.isClosedBoardPresent(boardname)) == false);
  });

  it("Should be able to delete a board", async () => {
    const boardname = "cypress";

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // navigating to closed boards
    await home.viewClosedBoards();
    // deleting board
    await home.deleteBoard(boardname);
    // checking presence of board in closed boards list
    const isPresent = await home.isClosedBoardPresent(boardname);
    assert(isPresent == false);
  });

  it("Should be able to add a list to a board", async () => {
    const boardname = "playwright";
    let count = 0;

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards(boardname);
    // adding a list to the board
    await board.addNewList("To Do");
    count = await board.getNoOfLists();
    // asserting number of lists in board at this moment
    assert(count == 1);
    // adding a list to the board
    await board.addNewList("In Progress");
    count = await board.getNoOfLists();
    // asserting number of lists in board at this moment
    assert(count == 2);
    // adding a list to the board
    await board.addNewList("Done");
    count = await board.getNoOfLists();
    // asserting number of lists in board at this moment
    assert(count == 3);
  });

  it("Should be able to add a cards to a list", async () => {
    // dummy data for the cards
    const boardname = "playwright";
    const listname = "To Do";
    const tasks = [
      "Read Documentation",
      "Download file",
      "Setup in project",
      "Create first test",
    ];
    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards(boardname);
    // adding cards to list
    await board.addCardToList(tasks, listname);
    // asserting presence of cards in list
    assert((await board.getNoOfCardsInList(listname)) == 4);
  });

  it("Should be able to move cards from one list to another", async () => {
    const boardname = "playwright";

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards(boardname);
    // moving card from one list to another
    await board.moveCardTo("Read Documentation", "In Progress");
    // checking presence of the card in the 'new' list
    assert(
      (await board.isCardinList("Read Documentation", "In Progress")) == true
    );
    // moving card from one list to another
    await board.moveCardTo("Download file", "In Progress");
    // checking presence of the card in the 'new' list
    assert((await board.isCardinList("Download file", "In Progress")) == true);
    // moving card from one list to another
    await board.moveCardTo("Create first test", "In Progress");
    // checking presence of the card in the 'new' list
    assert(
      (await board.isCardinList("Create first test", "In Progress")) == true
    );
    // moving card from one list to another
    await board.moveCardTo("Read Documentation", "Done");
    // checking presence of the card in the 'new' list
    assert((await board.isCardinList("Read Documentation", "Done")) == true);
    // moving card from one list to another
    await board.moveCardTo("Create first test", "To Do");
    // checking presence of the card in the 'new' list
    assert((await board.isCardinList("Create first test", "To Do")) == true);
    // moving card from one list to another
    await board.moveCardTo("Download file", "Done");
    // checking presence of the card in the 'new' list
    assert((await board.isCardinList("Download file", "Done")) == true);
  });

  it("Should be able to update a card description", async () => {
    const boardname = "playwright";

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards(boardname);
    // assuming card names are unique in this demo
    const id = await board.getCardId("Create first test");
    // updating the description on the card using its Id
    await board.updateCardDescription(
      "Create first test",
      "Design first test and test suite"
    );
    // asserting change in description
    assert(id == (await board.getCardId("Design first test and test suite")));
  });

  it("Should be able add a checklist to a card", async () => {
    const boardname = "playwright";

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards(boardname);
    // retrieving card id
    const id = await board.getCardId("Setup in project");
    // dummy data for checklist
    const checklistItems = [
      "create folder structure",
      "do npm init",
      "add dependencies to package json",
    ];
    // adding checklist items to checklist
    await board.addCardChecklistWithItems(id, "My checklist", checklistItems);
    // asserting if checklist is present
    assert((await board.isChecklistPresent("My checklist")) == true);
    // asserting if items in checklist are present
    assert(
      (await board.itemsInChecklist("My checklist", checklistItems)) == true
    );
  });

  it("Should be able to update the card checklist", async () => {
    const boardname = "playwright";
    const checkListName = "My checklist";
    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // opening board
    await home.openBoardInBoards(boardname);
    // retrieving card Id
    const id = await board.getCardId("Setup in project");
    // dummy items to complete on checklist
    const checklistItems = ["create folder structure", "do npm init"];
    // complete checklist items
    await board.completeCheckListItems(id, checkListName, checklistItems);
    // assert checklist percentage completed based on items completed
    assert((await board.getChecklistCompletion(checkListName)) == "67%");
  });


  it("Should clean up the environment", async () => {
    const boardname = "playwright";

    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();

    // opening board
    await home.openBoardInBoards(boardname);
    // closing board
    await board.closeBoard();

    await home.navigate(username);
    
    // go to Team Boards under Trello Workspace
    await home.getTeamsBoards();
    // navigating to closed boards
    await home.viewClosedBoards();
    // deleting board
    await home.deleteBoard(boardname);

    await home.goToHome();
    await home.getTeamsBoards();
    // cleaning up dummy created
    await home.viewClosedBoards();
  
    await home.deleteBoard("dummy");

  });

});
