/**
 * Extends the Token class to implement system-specific token functionality
 * @extends {Token}
 */
export default class FFToken extends Token {
  /**
   * Whether this token represents an ally
   * @return {boolean} True if the token is an ally
   */
  get isAlly() {
    return this.document.disposition === 1;
  }

  /**
   * Whether this token represents an enemy
   * @return {boolean} True if the token is an enemy
   */
  get isEnemy() {
    return this.document.disposition === -1;
  }
}