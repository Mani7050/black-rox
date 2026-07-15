interface AdminNotificationsProps { addToast: (type: string, title: string, msg: string) => void; }

export default function AdminNotifications({ addToast }: AdminNotificationsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Alert Template Broadcast Center</h2>
        <p className="text-xs text-muted-foreground">Send real-time alerts or system notifications directly to the live screens of connected retail users</p>
      </div>
      <div className="bg-card border border-border p-5 rounded-none max-w-lg">
        <h3 className="text-sm font-bold text-foreground mb-4">Send System-wide Message</h3>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1.5">Notification Banner Message</label>
            <textarea rows={3} placeholder="Type operational alerts here..." className="w-full bg-background border border-border rounded-none p-3 outline-none focus:border-primary text-foreground" />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1.5">Severity Badge Color</label>
            <select className="w-full bg-background border border-border rounded-none px-3 py-2 font-semibold">
              <option value="info">Information (Blue)</option>
              <option value="warning">Warning Notice (Orange)</option>
              <option value="error">Emergency Alert (Red)</option>
            </select>
          </div>
          <button
            onClick={() => addToast('success', 'Alert Broadcasted', 'Notification banner pushed to active client sessions.')}
            className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            Broadcast System Alert Banner
          </button>
        </div>
      </div>
    </div>
  );
}
