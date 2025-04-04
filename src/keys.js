import * as ed from "@noble/ed25519";

/**
 * Currently only implemented for ed25519 keys, but could be refactored
 * to support Secp256k1 as well
 */
class Key {
  constructor(bytes) {
    this._bytes = bytes;
  }

  /**
   * Hex encode key bytes
   */
  toHex() {
    return ed.etc.bytesToHex(this._bytes);
  }

  /**
   * Get raw key bytes
   */
  get bytes() {
    return this._bytes;
  }

  static fromHex(hexKey) {
    return new Key(ed.etc.hexToBytes(hexKey));
  }
}

class Keypair {
  constructor(alias, privateKey, publicKey, algorithm = "ed25519") {
    this._alias = alias;
    this._privateKey = new Key(privateKey);
    this._publicKey = new Key(publicKey);
    this._algorithm = algorithm;
  }

  values() {
    return {
      alias: this._alias,
      algorithm: this._algorithm,
      privateKey: this._privateKey.toHex(),
      publicKey: this._publicKey.toHex(),
    };
  }

  raw() {
    return {
      alias: this._alias,
      algorithm: this._algorithm,
      privateKey: this._privateKey.bytes(),
      publicKey: this._publicKey.bytes(),
    };
  }

  /**
   * Define getters to simplify destructuring: Keys will be returned as Uint8Array
   */
  get alias() {
    return this._alias;
  }

  get algorithm() {
    return this._algorithm;
  }

  get privateKey() {
    return this._privateKey.bytes;
  }

  get publicKey() {
    return this._publicKey.bytes;
  }

  /**
   * Instantiate class from stored record
   */
  static fromStoredKeypair(keypairRecord) {
    const { alias, algorithm, privateKey, publicKey } = keypairRecord;
    return new Keypair(
      alias,
      ed.etc.hexToBytes(privateKey),
      ed.etc.hexToBytes(publicKey),
      algorithm,
    );
  }

  /**
   * Instantiate class from generated keys
   */
  static async genEd25519Keypair(alias) {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKeyAsync(privateKey);

    return new Keypair(alias, privateKey, publicKey, "ed25519");
  }
}

export { Key, Keypair };
