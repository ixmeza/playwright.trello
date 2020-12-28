const BasePage = require("./base.page.js");

class BoardPage extends BasePage {
  constructor(page) {
    super(page);
    this.boardTitle = `.board-header-btn.mod-board-name.inline-rename-board.js-rename-board h1`;
    this.addList = `.open-add-list.js-open-add-list`;
    this.moreMenu = `.board-menu-navigation-item-link.js-open-more`;
    this.closeBoardLink = `.board-menu-navigation-item-link.js-close-board`;
    this.closeBoardBtn = `input[value='Close']`;
    this.reOpenBoardLink = `.js-reopen`;
    this.permDeleteBoardLink = `.quiet.js-delete`;
    this.bigMessage = `.big-message.quiet.closed-board h1`;
    this.listNameInput = `.list-name-input`;
    this.addListBtn = `.nch-button.nch-button--primary.mod-list-add-button.js-save-edit`;
    this.addCardBtn = `.nch-button.nch-button--primary.confirm.mod-compact.js-add-card`;
    this.openListInput = `.open-add-list.js-open-add-list`;
    this.addCardInput = `.js-add-a-card`;
    this.quickSaveBtn = `[value='Save']`;
    this.quickMoveBtn = `[value='Move']`;
    this.quickMoveOption = `.quick-card-editor-buttons-item.js-move-card`;
    this.listOptions = `.js-select-list`;
    this.quickEditDescriptionTxt = `textarea.list-card-edit-title.js-edit-card-title`;
    this.checkListIcon = `span.icon-sm.icon-checklist`;
    this.quickAddBtn = `[value='Add']`;
    this.addItemCheckListTxt = `textarea[placeholder='Add an item']`;
    this.checkListNameTxt = `input[value='Checklist']`;
  }

  async addNewList(listname) {
    await this.page.click(this.openListInput);
    await this.page.fill(this.listNameInput, listname);
    await this.page.click(this.addListBtn);
    await this.page.click("#board");
    await this.page.waitForTimeout("1000");
  }

  async closeBoard() {
    await this.page.click(this.moreMenu);
    await this.page.click(this.closeBoardLink);
    await this.page.click(this.closeBoardBtn);
    await this.page.waitForSelector(this.bigMessage), { state: "visible" };
  }
  async reOpenBoard() {
    await this.page.click(this.reOpenBoardLink);
  }
  async permDeleteBoard() {
    await this.page.click(this.permDeleteBoardLink);
  }

  async getNoOfLists() {
    const no = await this.page.$$(".list.js-list-content");
    return no.length;
  }
  async getNoOfCardsInList(listname) {
    const noOfCardsInnerText = await this.page.innerText(
      `//h2[text()='${listname}']/parent::div//*[@class='list-header-num-cards hide js-num-cards']`
    );
    const regex = /^\d+/gm;
    const noOfCards = noOfCardsInnerText.match(regex);
    return noOfCards;
  }

  async addCardToList(cardname, listname) {
    let aux;
    for (let i = 0; i < cardname.length; i++) {
      aux =
        (await this.getNoOfCardsInList(listname)) > 0
          ? "js-add-another-card"
          : "js-add-a-card";
      await this.page.click(
        `//h2[text()='${listname}']/ancestor::div[@class='js-list list-wrapper']//*[@class='${aux}']`
      );
      await this.page.fill(
        `.list-card-composer-textarea.js-card-title`,
        `${cardname[i]}`
      );
      await this.page.click(this.addCardBtn);
      await this.page.click("#board");
    }
  }
  async moveCardTo(cardname, listDestination) {
    const cardToMove = await this.page.waitForSelector(
      `//a[@class='list-card js-member-droppable ui-droppable']//*[text()='${cardname}']`,
      { state: "visible" }
    );
    await cardToMove.hover();
    const editBtn = await this.page.waitForSelector(
      `//a[@class='list-card js-member-droppable ui-droppable active-card']//*[text()='${cardname}']/ancestor::a/span[@class='icon-sm icon-edit list-card-operation dark-hover js-open-quick-card-editor js-card-menu']`
    );
    await editBtn.click();
    await this.page.waitForSelector(this.quickSaveBtn);
    await this.page.waitForSelector(this.quickMoveOption);
    await this.page.click(this.quickMoveOption);
    const dropdown = await this.page.waitForSelector(this.listOptions);
    await dropdown.selectOption({ label: `${listDestination}` });
    await this.page.click(this.quickMoveBtn);
    await this.page.waitForTimeout(500);
  }

  async isCardinList(cardname, listname) {
    let isCardInList = false;
    const cardsInList = await this.page.$$(
      `//h2[text()='${listname}']/ancestor::div[@class='js-list list-wrapper']//a[@class='list-card js-member-droppable ui-droppable']`
    );
    for (let i = 0; i < cardsInList.length; i++) {
      if ((await cardsInList[i].innerText()) == cardname) {
        isCardInList = true;
        break;
      }
    }
    return isCardInList;
  }

  async getCardId(cardname) {
    const hiddenId = await this.page.$(
      `//span[@class='list-card-title js-card-name'][text()='${cardname}']/span[@class='card-short-id hide']`
    );
    const id = await hiddenId.innerText();
    return id;
  }

  async updateCardDescription(cardname, description) {
    const cardToMove = await this.page.waitForSelector(
      `//a[@class='list-card js-member-droppable ui-droppable']//*[text()='${cardname}']`,
      { state: "visible" }
    );
    await cardToMove.hover();
    const editBtn = await this.page.waitForSelector(
      `//a[@class='list-card js-member-droppable ui-droppable active-card']//*[text()='${cardname}']/ancestor::a/span[@class='icon-sm icon-edit list-card-operation dark-hover js-open-quick-card-editor js-card-menu']`
    );
    await editBtn.click();
    await this.page.waitForSelector(this.quickSaveBtn);
    await this.page.fill(this.quickEditDescriptionTxt, description);
    await this.page.click(this.quickSaveBtn);
  }

  async addCardChecklistWithItems(cardId, checklistname, checklistItems) {
    await this.page.click(
      `a[href*="${cardId.substring(
        1
      )}"].list-card.js-member-droppable.ui-droppable`
    );
    await this.page.waitForSelector(this.checkListIcon);
    await this.page.click(this.checkListIcon);
    await this.page.fill(this.checkListNameTxt, checklistname);
    await this.page.click(this.quickAddBtn);
    for (let i = 0; i < checklistItems.length; i++) {
      await this.page.click(this.addItemCheckListTxt);
      await this.page.fill(this.addItemCheckListTxt, checklistItems[i]);
      await this.page.click(this.quickAddBtn);
    }
  }

  async completeCheckListItems(cardId, checklistname, checklistItems) {
    await this.page.click(
      `a[href*="${cardId.substring(
        1
      )}"].list-card.js-member-droppable.ui-droppable`
    );
    for (let i = 0; i < checklistItems.length; i++) {
      await this.page.click(
        `//*[text()='${checklistname}']/ancestor::div[@class='checklist']//*[text()='${checklistItems[i]}']/ancestor::div[@class='checklist-item no-assignee no-due']/div[@data-test-id='checklist-item-checkbox']`
      );
    }
  }

  async isChecklistPresent(checklistname) {
    const checklist = await this.page.waitForSelector(
      `//*[@class='checklist']//*[text()='${checklistname}']`
    );
    return checklist != undefined ? true : false;
  }

  async itemsInChecklist(checklistName, checklistItems) {
    const actualItems = await this.page.$$(
      `//*[text()='${checklistName}']/ancestor::div[@class='checklist']/div[@class='checklist-items-list js-checklist-items-list js-no-higher-edits ui-sortable']/div//span[@class='checklist-item-details-text markeddown js-checkitem-name']`
    );
    for (let i = 0; i < checklistItems.length; i++) {
      if (checklistItems[i] != (await actualItems[i].innerText())) return false;
    }
    return true;
  }

  async getChecklistCompletion(checklistName) {
    const percentage = await this.page.$(
      `//*[text()='${checklistName}']/ancestor::div[@class='checklist']//span[@class='checklist-progress-percentage js-checklist-progress-percent']`
    );
    return await percentage.innerText();
  }
}
module.exports = BoardPage;
