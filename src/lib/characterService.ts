import { Character } from "../interfaces/Character";
import { auth } from "../firebaseConfig";

const COLLECTION_NAME = "characters";

export const CharacterService = {
  // Salvar um novo personagem (Global - Deprecated or Admin only?)
  // Maintaining for compatibility but preferring user-specific
  async saveCharacter(characterData: any) {
    try {
      const { collection, addDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../firebaseConfig");

      const dataToSave = {
        ...characterData,
        createdAt: serverTimestamp(),
      };

      // If user is logged in, save to their subcollection
      const user = auth.currentUser;
      if (user) {
        return this.saveUserCharacter(user.uid, dataToSave);
      }

      // Fallback to global (or error out if auth required)
      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar personagem:", error);
      throw error;
    }
  },

  // Save to specific user subcollection
  async saveUserCharacter(uid: string, characterData: any) {
    try {
      const { collection, addDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../firebaseConfig");

      const dataToSave = {
        ...characterData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "users", uid, "characters"),
        dataToSave
      );
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar personagem do usuário:", error);
      throw error;
    }
  },

  // Update a character
  async updateCharacter(
    uid: string,
    charId: string,
    updates: Partial<Character>
  ) {
    try {
      const { doc, updateDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../firebaseConfig");

      const charRef = doc(db, "users", uid, "characters", charId);

      const dataToUpdate = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(charRef, dataToUpdate);
    } catch (error) {
      console.error("Erro ao atualizar personagem:", error);
      throw error;
    }
  },

  // Listar todos os personagens (Global - Deprecated?)
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

  // Deletar um personagem (Global path)
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
