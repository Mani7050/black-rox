import { FileSpreadsheet, FileText, Shield, Database } from 'lucide-react';

interface AdminReportsProps { addToast: (type: string, title: string, msg: string) => void; }

export default function AdminReports({ addToast }: AdminReportsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Analytics Sheets & Audits</h2>
        <p className="text-xs text-muted-foreground">Export and examine user-wise strategy yields and trade performance spreadsheets</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-5 rounded-none text-center flex flex-col justify-between">
          <div className="flex flex-col items-center">
            <FileSpreadsheet className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-xs text-foreground">User-wise PnL Report</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Export complete table mapping user profits and loss statistics</p>
          </div>
          <button onClick={() => addToast('success', 'Report Exported', 'User Performance spreadsheet downloaded.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none shadow mt-4 cursor-pointer">
            Download XLSX Spreadsheet
          </button>
        </div>
        <div className="bg-card border border-border p-5 rounded-none text-center flex flex-col justify-between">
          <div className="flex flex-col items-center">
            <FileText className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-xs text-foreground">Complete Order Book</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Download complete history logs of today's buy and sell transactions</p>
          </div>
          <button onClick={() => addToast('success', 'Report Exported', 'Platform trade ledger downloaded.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none shadow mt-4 cursor-pointer">
            Download CSV Ledger
          </button>
        </div>
        <div className="bg-card border border-border p-5 rounded-none text-center flex flex-col justify-between">
          <div className="flex flex-col items-center">
            <Shield className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-xs text-foreground">Audit Compliance Report</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Export full history record of administrator changes and safety triggers</p>
          </div>
          <button onClick={() => addToast('success', 'Report Exported', 'System Audit logs exported.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none shadow mt-4 cursor-pointer">
            Export PDF Compliance
          </button>
        </div>
      </div>
    </div>
  );
}
