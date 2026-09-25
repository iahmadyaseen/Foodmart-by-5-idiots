export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'super_admin';
  isSuperAdmin: boolean;
  ordersCount: number;
  createdAt: string;
  lastLoginAt: string;
}

export const userService = {
  /**
   * Fetch all registered Food Mart users
   */
  async getAllUsers(): Promise<AdminUserListItem[]> {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) return [];
      const data = await res.json();
      return data.users || [];
    } catch (err) {
      console.error('Error fetching admin users:', err);
      return [];
    }
  },

  /**
   * Super Admin only: Promote or demote user role
   */
  async updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update user role' };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error updating user role:', err);
      return { success: false, error: err?.message || 'Network error updating user role' };
    }
  },
};
