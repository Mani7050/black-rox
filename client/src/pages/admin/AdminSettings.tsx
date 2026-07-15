import { Database } from 'lucide-react';
interface AdminSettingsProps { addToast: (type: string, title: string, msg: string) => void; }

export default function AdminSettings({ addToast }: AdminSettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">System & API Configurations</h2>
        <p className="text-xs text-muted-foreground">Adjust server database synchronization and security timeouts</p>
      </div>
      <div className="bg-card border border-border p-5 rounded-none max-w-lg space-y-4 text-xs">
        <h3 className="text-sm font-bold text-foreground">Global Parameters</h3>
        <div className="flex justify-between items-center py-2 border-b border-border/40">
          <div>
            <p className="font-semibold text-foreground">Server Sandbox Simulation Mode</p>
            <p className="text-[10px] text-muted-foreground">Allows offline trade executions with ticker directions</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer accent-primary" />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/40">
          <div>
            <p className="font-semibold text-foreground">Maintenance Mode</p>
            <p className="text-[10px] text-muted-foreground">Prevents user logins while compiling updates</p>
          </div>
          <input type="checkbox" className="w-4 h-4 cursor-pointer accent-primary" />
        </div>
        <button
          onClick={() => addToast('success', 'Backup Initiated', 'Database state saved locally to server/backup_state.json')}
          className="bg-card border border-border hover:bg-muted px-4 py-2 font-bold rounded-none flex items-center gap-2 cursor-pointer"
        >
          <Database className="w-4 h-4 text-primary" />
          Initiate System Backup
        </button>
      </div>
    </div>
  );
}
