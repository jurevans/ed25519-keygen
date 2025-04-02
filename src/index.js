import { Store } from "./storage";
import { Keypair } from "./keys";

const LOCALSTORAGE_PREFIX = "kudos-localstorage";
const KEYSTORE_KEY = "kudos-keystore";

/**
 * @returns Keypair instance
 */
const clearListing = () => {
  const ul = document.getElementById("key-list");
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
};

const insertKeypair = (keypair) => {
  const { alias, publicKey, algorithm } = keypair.values;
  const ul = document.getElementById("key-list");
  const li = document.createElement("li");
  li.innerHTML = `<strong>${alias}</strong> ${algorithm} ${publicKey}`;
  ul.appendChild(li);
};

const updateList = (keypairs) => {
  clearListing();
  keypairs.forEach((keypair) => insertKeypair(keypair));
};

const app = async () => {
  // DOM
  const store = new Store(KEYSTORE_KEY, LOCALSTORAGE_PREFIX);
  const keyAliasInput = document.getElementById("key-alias");
  const keygenButton = document.getElementById("gen-keypair");

  // Data
  const records = ((await store.getAll()) || []).map((record) =>
    Keypair.fromStoredKeypair(record),
  );

  updateList(records);

  keygenButton.addEventListener("click", async () => {
    const alias = keyAliasInput.value.trim();
    if (alias === "") {
      throw { message: "Alias was not provided!" };
    }

    if (await store.get(alias)) {
      // TODO: Add error container for validation messages!
      console.error(`Keypair for ${alias} exists! Choose a different name.`);
      return;
    }

    try {
      const keypair = await Keypair.genEd25519Keypair(alias);

      await store.add(alias, keypair.values);
      const records = ((await store.getAll()) || []).map((record) =>
        Keypair.fromStoredKeypair(record),
      );
      updateList(records);
    } catch (e) {
      console.error(e);
    }
  });
};

app();
