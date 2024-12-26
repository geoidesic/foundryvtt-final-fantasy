export default class FFToken extends Token {

  get isAlly() {
    return this.document.disposition === 1;
  }

  get isEnemy() {
    return this.document.disposition === -1;
  }

  
}