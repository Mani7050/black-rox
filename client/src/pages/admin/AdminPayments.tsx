interface Payment { id: string; userEmail: string; planName: string; amount: number; date: string; status: string; }
interface AdminPaymentsProps { paymentsList: Payment[]; addToast: (type: string, title: string, msg: string) => void; }

export default function AdminPayments({ paymentsList, addToast }: AdminPaymentsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Invoice & Payment Controls</h2>
        <p className="text-xs text-muted-foreground">Review account licensing transactions, download invoices and manage subscription payments</p>
      </div>
      <div className="bg-card border border-border rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
              <th className="p-4">Receipt ID</th>
              <th className="p-4">User Account</th>
              <th className="p-4">License Plan</th>
              <th className="p-4">Amount Paid</th>
              <th className="p-4">Transaction Date</th>
              <th className="p-4">Receipt Status</th>
              <th className="p-4 text-right">Invoices</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {paymentsList.map(pay => (
              <tr key={pay.id} className="hover:bg-muted/10 font-mono">
                <td className="p-4 font-bold">{pay.id}</td>
                <td className="p-4 text-foreground font-semibold">{pay.userEmail}</td>
                <td className="p-4">{pay.planName}</td>
                <td className="p-4 font-bold text-foreground">₹{pay.amount}</td>
                <td className="p-4 text-muted-foreground">{new Date(pay.date).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-extrabold capitalize">
                    {pay.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => addToast('success', 'PDF Invoice Generated', `Invoice PDF for receipt ${pay.id} downloaded.`)}
                    className="bg-card border border-border hover:bg-muted text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
