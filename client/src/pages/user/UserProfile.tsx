interface UserProfileProps {
  user: { name?: string; email?: string; role?: string } | null;
  addToast: (type: string, title: string, msg: string) => void;
}

export default function UserProfile({ user, addToast }: UserProfileProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
        <p className="text-xs text-muted-foreground">Manage authorized email coordinates, credentials password and multi-factor safety tokens</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5 rounded-none space-y-3.5 text-xs shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-2">User Details</h3>
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground font-semibold">Profile Name:</span>
            <span className="font-bold text-foreground">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground font-semibold">Registered Email:</span>
            <span className="font-mono text-foreground">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground font-semibold">Access Privilege:</span>
            <span className="capitalize font-bold text-primary">{user?.role} Role</span>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-none space-y-4 text-xs shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Security Toggles</h3>
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <div>
              <p className="font-semibold text-foreground">Enforce 2FA Authenticator Token</p>
              <p className="text-[10px] text-muted-foreground">Mandates typing 6-digit pin during login</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer accent-primary" />
          </div>
          <button
            onClick={() => addToast('success', 'Security Token Generated', 'New 2FA setup QR Code token generated.')}
            className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-none mt-4 cursor-pointer hover:opacity-90 transition-opacity"
          >
            Setup New Authenticator Token
          </button>
        </div>
      </div>
    </div>
  );
}
