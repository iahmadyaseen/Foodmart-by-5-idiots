import { ContactMessage } from '../types';

export const contactService = {
  /**
   * Submit contact message to Prisma database and trigger Super Admin email
   */
  async sendMessage(
    name: string,
    email: string,
    message: string
  ): Promise<{ message: ContactMessage; emailDispatched?: boolean; emailNote?: string }> {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit contact message');
    }

    const data = await res.json();
    return {
      message: data.message,
      emailDispatched: data.emailDispatched,
      emailNote: data.emailNote,
    };
  },

  /**
   * Admin: Get all contact messages
   */
  async getAllMessages(): Promise<ContactMessage[]> {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      return [];
    }
  },

  /**
   * Admin: Mark message as read
   */
  async markRead(id: string): Promise<void> {
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  },
};
