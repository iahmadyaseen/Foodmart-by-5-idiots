import { ContactMessage } from '../types';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType, ADMIN_EMAIL } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore';

const LOCAL_STORAGE_MESSAGES_KEY = 'foodmart_contact_messages';

export const contactService = {
  /**
   * Submit contact message
   */
  async sendMessage(name: string, email: string, message: string): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    // Save to local storage
    const all = this.getLocalMessages();
    const updated = [newMessage, ...all];
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated));

    // Save to Firestore
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'contactMessages', newMessage.id), newMessage);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `contactMessages/${newMessage.id}`);
      }
    }

    // Trigger notification log for owner ay8880625@gmail.com
    console.log(`[FOOD MART OWNER NOTIFICATION] Sent to ${ADMIN_EMAIL}:\nFOOD MART — New Contact Message\nName: ${name}\nEmail: ${email}\nMessage: ${message}`);

    return newMessage;
  },

  /**
   * Admin: Get all contact messages
   */
  async getAllMessages(): Promise<ContactMessage[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'contactMessages');
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const msgs: ContactMessage[] = [];
          snap.forEach(d => msgs.push(d.data() as ContactMessage));
          msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return msgs;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'contactMessages');
      }
    }

    return this.getLocalMessages();
  },

  /**
   * Admin: Mark message read
   */
  async markRead(id: string): Promise<void> {
    const all = this.getLocalMessages();
    const updated = all.map(m => (m.id === id ? { ...m, read: true } : m));
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'contactMessages', id), { read: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `contactMessages/${id}`);
      }
    }
  },

  getLocalMessages(): ContactMessage[] {
    const saved = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error reading contact messages:', e);
      }
    }
    return [];
  }
};
