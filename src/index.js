import { Store } from "./storage";
import { Keypair } from "./keys";

const LOCALSTORAGE_PREFIX = "kudos-localstorage";
const KEYSTORE_KEY = "kudos-keystore";

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
  li.innerHTML = `<strong>${alias}</strong> ${algorithm} ${publicKey} `;
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.value = alias;
  deleteButton.onclick = (e) => deleteKey(e.target.value);
  li.appendChild(deleteButton);
  ul.appendChild(li);
};

const updateList = (keypairs) => {
  clearListing();
  keypairs.forEach((keypair) => insertKeypair(keypair));
};

const setError = (error) => {
  document.getElementById("error-container").innerHTML = error;
};

const getRecords = async (store) => {
  return ((await store.getAll()) || []).map((record) =>
    Keypair.fromStoredKeypair(record),
  );
};

const deleteKey = async (alias) => {
  const store = new Store(KEYSTORE_KEY, LOCALSTORAGE_PREFIX);
  await store.remove(alias);
  updateList(await getRecords(store));
};

const app = async () => {
  // Instantiate store
  const store = new Store(KEYSTORE_KEY, LOCALSTORAGE_PREFIX);

  // DOM
  const keyAliasInput = document.getElementById("key-alias");
  const keygenButton = document.getElementById("gen-keypair");

  // Fetch latest records and update list
  updateList(await getRecords(store));

  // Register event listeners
  keygenButton.addEventListener("click", async () => {
    const alias = keyAliasInput.value.trim();
    if (alias === "") {
      setError("Alias was not provided!");
      return;
    }

    if (await store.get(alias)) {
      setError(`Keypair for ${alias} exists! Choose a different name.`);
      return;
    }

    try {
      setError("");

      const keypair = await Keypair.genEd25519Keypair(alias);
      await store.add(alias, keypair.values);
      updateList(await getRecords(store));
    } catch (e) {
      setError(console.error(e));
    }
  });
};

app();
