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

  // Listar personagens
  async getCharacters(userId?: string, isMestre: boolean = false) {
    try {
      const { collection, getDocs, query, collectionGroup } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../firebaseConfig");

      let q;

      if (isMestre) {
        // Mestre vê TODOS os personagens de todas as subcoleções 'characters'
        q = query(collectionGroup(db, "characters"));
      } else if (userId) {
        // Usuário vê apenas os seus na subcoleção
        q = query(collection(db, "users", userId, "characters"));
      } else {
        // Fallback: Tenta buscar globais se não estiver logado (ou se for o comportamento antigo)
        q = query(collection(db, COLLECTION_NAME));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        path: doc.ref.path, // Salva o caminho para poder atualizar/deletar depois
        ...(doc.data() as any),
      }));
    } catch (error) {
      console.error("Erro ao carregar personagens:", error);
      throw error;
    }
  },

  // Deletar um personagem
  async deleteCharacter(id: string, path?: string) {
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { db } = await import("../firebaseConfig");

      if (path) {
        await deleteDoc(doc(db, path));
      } else {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
      }
    } catch (error) {
      console.error("Erro ao deletar personagem:", error);
      throw error;
    }
  },
};
