import { Character } from "../interfaces/Character";

const COLLECTION_NAME = "characters";

export const CharacterService = {
  // Salvar um novo personagem
  async saveCharacter(characterData: any) {
    try {
      const { collection, addDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../firebaseConfig");

      // Removemos funções ou instâncias complexas para salvar no Firestore (objetos puros)
      const dataToSave = {
        ...characterData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar personagem:", error);
      throw error;
    }
  },

  // Listar todos os personagens (por enquanto todos, depois podemos filtrar por usuário)
  async getCharacters() {
    try {
      const { collection, getDocs, query } = await import("firebase/firestore");
      const { db } = await import("../firebaseConfig");

      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
    } catch (error) {
      console.error("Erro ao carregar personagens:", error);
      throw error;
    }
  },

  // Deletar um personagem
  async deleteCharacter(id: string) {
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { db } = await import("../firebaseConfig");

      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Erro ao deletar personagem:", error);
      throw error;
    }
  },
};
