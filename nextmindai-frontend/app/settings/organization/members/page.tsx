"use client";

export default function MembersPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Members</h1>
      <p className="text-[14px] text-text-secondary mb-8">Manage your organization's members and their roles.</p>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[12px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-text-primary">Team Members</h2>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
              Invite Member
            </button>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg">
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[12px] font-semibold text-primary">D</div>
                      <div>
                        <p className="text-[13px] font-medium text-text-primary">dev@test.com</p>
                        <p className="text-[11px] text-text-secondary">You</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-[11px] font-medium bg-primary/10 text-primary">Owner</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">Today</td>
                  <td className="px-4 py-3 text-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
