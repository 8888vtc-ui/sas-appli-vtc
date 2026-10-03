import { jsPDF } from 'jspdf';
import { formatEUR } from './utils';

/** Facture PDF rapide générée depuis le cockpit. */
export const generateFacturePDF = (trip: any, settings: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE VTC', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`N° Facture : F-${new Date().getFullYear()}-${trip.id.substring(0,6).toUpperCase()}`, pageWidth - 14, 26, { align: 'right' });

  // Société
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'Mon Entreprise VTC', 14, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.companyAddress || '', 14, 46);
  doc.text(`SIRET : ${settings.siret || 'N/A'}`, 14, 52);
  doc.text(`TVA : ${settings.tvaNumber || 'N/A'}`, 14, 58);

  // Client
  doc.setFont('helvetica', 'bold');
  doc.text('Client :', pageWidth - 80, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(trip.clientName || 'Client', pageWidth - 80, 46);
  
  // Détails
  doc.setFont('helvetica', 'bold');
  doc.text('Détails de la prestation', 14, 80);
  doc.line(14, 82, pageWidth - 14, 82);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date de course : ${trip.date}`, 14, 90);
  doc.text(`Départ : ${trip.pickUpLocation}`, 14, 96);
  doc.text(`Arrivée : ${trip.dropOffLocation || 'Mise à disposition'}`, 14, 102);

  // Totaux
  const tvaRate = settings.tvaRegime === 'assujetti' ? (settings.tvaRate || 10) : 0;
  const priceTTC = trip.price || 0;
  const priceHT = priceTTC / (1 + (tvaRate / 100));
  const tvaAmount = priceTTC - priceHT;

  doc.line(14, 120, pageWidth - 14, 120);
  doc.text('Total HT :', pageWidth - 60, 130);
  doc.text(formatEUR(priceHT), pageWidth - 14, 130, { align: 'right' });
  
  doc.text(`TVA (${tvaRate}%) :`, pageWidth - 60, 138);
  doc.text(formatEUR(tvaAmount), pageWidth - 14, 138, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC :', pageWidth - 60, 148);
  doc.text(formatEUR(priceTTC), pageWidth - 14, 148, { align: 'right' });

  // Mentions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const mention = settings.tvaRegime === 'franchise' ? 'TVA non applicable, art. 293 B du CGI.' : 'TVA acquittée sur les encaissements.';
  doc.text(mention, pageWidth / 2, 280, { align: 'center' });

  doc.save(`Facture_${trip.clientName.replace(/\s+/g, '_')}_${trip.date}.pdf`);
};
