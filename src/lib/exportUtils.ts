import type { Trip, InvoiceRecord } from '../types';

/**
 * Télécharge un fichier texte/Blob sous forme d'élément <a>
 */
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export CSV des factures
 */
export function exportInvoicesCSV(invoices: InvoiceRecord[], trips: Trip[]) {
  const headers = ['Numero_Facture', 'Date', 'Client', 'Montant_HT_EUR', 'TVA_EUR', 'Total_TTC_EUR', 'Statut'];
  
  const tripMap = new Map<string, Trip>();
  trips.forEach(t => tripMap.set(t.id, t));

  const rows = invoices.map(inv => {
    const trip = tripMap.get(inv.tripId);
    const dateStr = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('fr-FR') : '';
    const clientName = trip ? `"${trip.clientName.replace(/"/g, '""')}"` : 'Client';
    return [
      inv.invoiceNumber,
      dateStr,
      clientName,
      inv.amount.toFixed(2),
      inv.tvaAmount.toFixed(2),
      inv.totalTTC.toFixed(2),
      inv.paymentStatus === 'paid' ? 'Payée' : 'En attente'
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const filename = `export_factures_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export CSV des dépenses
 */
export function exportExpensesCSV(expenses: any[]) {
  const headers = ['Date', 'Description', 'Categorie', 'Montant_EUR'];
  
  const rows = expenses.map(exp => [
    exp.date || '',
    `"${(exp.description || '').replace(/"/g, '""')}"`,
    exp.category || 'other',
    (exp.amount || 0).toFixed(2)
  ].join(';'));

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const filename = `export_depenses_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export Sauvegarde globale JSON
 */
export function exportFullBackupJSON() {
  const backupData: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('vtc_')) {
      try {
        backupData[key] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        backupData[key] = localStorage.getItem(key);
      }
    }
  }

  const jsonString = JSON.stringify(backupData, null, 2);
  const filename = `sauvegarde_vtc_pro_${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(jsonString, filename, 'application/json');
}

/**
 * Import Restauration globale JSON
 */
export function importFullBackupJSON(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
