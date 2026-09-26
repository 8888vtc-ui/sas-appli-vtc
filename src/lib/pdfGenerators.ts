import { jsPDF } from 'jspdf';
import type { Trip, AppSettings, InvoiceRecord } from '../types';

function header(doc: jsPDF, s: AppSettings) {
  doc.setFontSize(18);
  doc.text(s.companyName || 'VTC', 20, 20);
  doc.setFontSize(9);
  doc.text(s.companyAddress || '', 20, 27);
  doc.text(`Tél: ${s.companyPhone || ''}`, 20, 32);
  if (s.companyEmail) doc.text(`Email: ${s.companyEmail}`, 120, 32);
  doc.text(`SIRET: ${s.siret || ''} | SIREN: ${s.siren || ''}`, 20, 37);
  doc.text(`Registre VTC: ${s.registreVTC || ''}`, 20, 42);
  if (s.driverName) {
    doc.text(`Chauffeur: ${s.driverName} | Carte Pro: ${s.driverCardNumber}`, 20, 47);
  }
  if (s.vehicleModel || s.vehiclePlate) {
    doc.text(`Véhicule: ${s.vehicleModel || ''} | Immat: ${s.vehiclePlate || ''}`, 20, 52);
    doc.setDrawColor(200); doc.line(20, 57, 190, 57);
  } else {
    doc.setDrawColor(200); doc.line(20, 52, 190, 52);
  }
}

function footer(doc: jsPDF, s: AppSettings) {
  const y = 275;
  doc.setFontSize(7);
  doc.setTextColor(120);
  if (s.tvaRegime === 'franchise') {
    doc.text('TVA non applicable, art. 293 B du Code général des impôts.', 20, y);
  } else {
    doc.text(`TVA Intracommunautaire: ${s.tvaNumber}`, 20, y);
  }
  doc.text('Loi Thévenoud - L.3120-1 et suivants du Code des transports.', 20, y + 4);
  doc.text('En cas de retard de paiement: pénalités au taux légal + indemnité forfaitaire de recouvrement de 40€ (clients pro).', 20, y + 12);
  doc.setTextColor(0);
}

function drawCompanyStamp(doc: jsPDF, s: AppSettings, x: number, y: number, w: number = 72, h: number = 26) {
  // Cadre double style tampon commercial d'entreprise
  doc.setDrawColor(24, 58, 114); // Bleu marine officiel
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');
  doc.setLineWidth(0.25);
  doc.roundedRect(x + 1, y + 1, w - 2, h - 2, 1.5, 1.5, 'S');

  // Contenu du cachet
  doc.setTextColor(24, 58, 114);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const company = (s.companyName || 'EXPLOITANT VTC').toUpperCase();
  doc.text(company, x + w / 2, y + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  if (s.siret) {
    doc.text(`SIRET : ${s.siret}`, x + w / 2, y + 9.5, { align: 'center' });
  }
  if (s.registreVTC) {
    doc.text(`REGISTRE VTC : ${s.registreVTC}`, x + w / 2, y + 14, { align: 'center' });
  }
  if (s.companyPhone || s.driverPhone) {
    doc.text(`TÉL : ${s.companyPhone || s.driverPhone}`, x + w / 2, y + 18, { align: 'center' });
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('✓ CACHET EXPLOITANT CERTIFIÉ', x + w / 2, y + 23, { align: 'center' });

  // Reset couleurs
  doc.setDrawColor(0);
  doc.setTextColor(0);
  doc.setLineWidth(0.2);
}

function drawClientValidationBox(doc: jsPDF, trip: Trip, x: number, y: number, w: number = 75, h: number = 26) {
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');

  if (trip.signature) {
    try {
      doc.addImage(trip.signature, 'PNG', x + 3, y + 3, w - 6, h - 6);
      return;
    } catch (e) {
      console.error('Error adding signature', e);
    }
  }

  // Si pas de signature manuscrite : validation électronique automatique
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(trip.clientName, x + w / 2, y + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Accord de réservation préalable', x + w / 2, y + 11, { align: 'center' });
  doc.text(`Tél : ${trip.clientPhone || 'Renseigné'}`, x + w / 2, y + 15.5, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('(Validation électronique conforme Art. R.3122-1)', x + w / 2, y + 21, { align: 'center' });

  doc.setTextColor(0);
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
}

export function generateBonDeCommande(trip: Trip, s: AppSettings) {
  const doc = new jsPDF();
  header(doc, s);

  const startY = s.vehicleModel || s.vehiclePlate ? 67 : 62;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BON DE COMMANDE / BON DE RÉSERVATION VTC', 105, startY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('(Arrêté du 6 août 2025 - Art. R.3122-1 Code des transports)', 105, startY + 6, { align: 'center' });

  let y = startY + 18;
  const line = (label: string, value: string) => {
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y);
    y += 8;
  };

  line('Exploitant:', s.companyName);
  line('N° Registre VTC:', s.registreVTC);
  line('SIREN:', s.siren);
  line('Client:', trip.clientName);
  line('Tél Client:', trip.clientPhone);
  if (trip.clientEmail) line('Email Client:', trip.clientEmail);
  line('Réservation faite le:', trip.bookingDateTime);
  line('Prise en charge:', `${trip.date} à ${trip.time}`);
  line('Lieu départ:', trip.pickUpLocation);
  line('Destination:', trip.dropOffLocation || 'Mise à disposition');
  if (trip.flightNumber) line('N° Vol/Train:', trip.flightNumber);
  line('Passagers:', String(trip.passengerCount));

  if (s.driverName) {
    line('Chauffeur:', s.driverName);
    line('Carte Pro N°:', s.driverCardNumber);
  }
  if (s.vehiclePlate) {
    line('Véhicule:', `${s.vehicleModel} - ${s.vehiclePlate}`);
  }

  y += 5;
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text(`PRIX CONVENU: ${trip.price.toFixed(2)} EUR TTC`, 20, y);
  doc.setFont('helvetica', 'normal');

  y += 12;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('Cachet de l\'exploitant :', 20, y);
  doc.text('Validation client :', 115, y);

  drawCompanyStamp(doc, s, 20, y + 3, 72, 26);
  drawClientValidationBox(doc, trip, 115, y + 3, 75, 26);

  if (trip.notes) {
    y += 35;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Observations: ${trip.notes}`, 20, y);
  }

  footer(doc, s);
  doc.save(`bon_commande_${trip.clientName.replace(/\s/g, '_')}_${trip.date}.pdf`);
}

export function generateMiseADisposition(trip: Trip, s: AppSettings) {
  const doc = new jsPDF();
  header(doc, s);

  const startY = s.vehicleModel || s.vehiclePlate ? 67 : 62;

  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('CONTRAT DE MISE À DISPOSITION VTC', 105, startY, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  let y = startY + 16;
  const line = (label: string, value: string) => {
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y); doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y); y += 8;
  };

  line('Exploitant:', s.companyName);
  line('N° Registre VTC:', s.registreVTC);
  line('SIREN:', s.siren);
  line('Client:', trip.clientName);
  line('Tél Client:', trip.clientPhone);
  line('Réservation faite le:', trip.bookingDateTime);
  y += 4;
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('─── Conditions de la mise à disposition ───', 20, y); y += 8;
  doc.setFont('helvetica', 'normal');
  line('Début:', `${trip.date} à ${trip.time}`);
  line('Fin:', `${trip.disposalEndDate || '___'} à ${trip.disposalEndTime || '___'}`);
  line('Lieu RDV:', trip.pickUpLocation);
  line('Zone:', trip.disposalZone || 'À définir');
  line('Passagers:', String(trip.passengerCount));

  if (s.driverName) { line('Chauffeur:', s.driverName); line('Carte Pro:', s.driverCardNumber); }
  if (s.vehiclePlate) { line('Véhicule:', `${s.vehicleModel} - ${s.vehiclePlate}`); }

  y += 5;
  doc.setFontSize(9);
  doc.text('Le client s\'engage à respecter les horaires convenus. Tout dépassement sera facturé', 20, y); y += 5;
  doc.text('au tarif horaire convenu. Le chauffeur reste à disposition dans le périmètre défini.', 20, y); y += 5;
  doc.text('En cas de dommage, la responsabilité est couverte par l\'assurance RC Pro de l\'exploitant.', 20, y);

  y += 12;
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text(`PRIX CONVENU: ${trip.price.toFixed(2)} EUR TTC`, 20, y);

  y += 12;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('Cachet de l\'exploitant :', 20, y);
  doc.text('Validation client :', 115, y);

  drawCompanyStamp(doc, s, 20, y + 3, 72, 26);
  drawClientValidationBox(doc, trip, 115, y + 3, 75, 26);

  footer(doc, s);
  doc.save(`mise_dispo_${trip.clientName.replace(/\s/g, '_')}_${trip.date}.pdf`);
}

export function generateFacture(trip: Trip, s: AppSettings, invoiceNum: string) {
  const doc = new jsPDF();
  header(doc, s);

  const startY = s.vehicleModel || s.vehiclePlate ? 67 : 62;

  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 105, startY, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  doc.setFontSize(10);
  doc.text(`Facture N°: ${invoiceNum}`, 140, startY + 10);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 140, startY + 16);

  let y = startY + 28;
  doc.setFont('helvetica', 'bold'); doc.text('FACTURER À:', 20, y); y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(trip.clientName, 20, y); y += 5;
  doc.text(`Tél: ${trip.clientPhone}`, 20, y);
  if (trip.clientEmail) { y += 5; doc.text(`Email: ${trip.clientEmail}`, 20, y); }
  y += 12;

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255);
  doc.rect(20, y, 170, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Désignation', 22, y + 6);
  doc.text('Qté', 120, y + 6);
  doc.text('Prix Unit. HT', 135, y + 6);
  doc.text('Total HT', 170, y + 6);
  doc.setTextColor(0);
  y += 12;

  const desc = trip.tripType === 'disposal'
    ? `Mise à disposition VTC - ${trip.date} à ${trip.disposalEndDate || trip.date}`
    : `Transport VTC: ${trip.pickUpLocation} → ${trip.dropOffLocation}`;

  doc.setFont('helvetica', 'normal');
  doc.text(desc, 22, y);
  doc.text('1', 122, y);
  doc.text(`${trip.price.toFixed(2)} €`, 137, y);
  doc.text(`${trip.price.toFixed(2)} €`, 170, y);
  y += 6;
  doc.text(`Date: ${trip.date} | Heure: ${trip.time}`, 22, y);
  if (trip.flightNumber) { y += 5; doc.text(`Vol/Train: ${trip.flightNumber}`, 22, y); }
  y += 5; doc.text(`Passagers: ${trip.passengerCount}`, 22, y);

  y += 15;
  doc.line(120, y, 190, y); y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('Total HT:', 130, y);
  doc.text(`${trip.price.toFixed(2)} €`, 170, y); y += 7;
  const tvaRate = s.tvaRate ?? 10;
  if (s.tvaRegime === 'franchise') {
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('TVA non applicable (art. 293 B du CGI)', 130, y); y += 7;
  } else {
    doc.text(`TVA ${tvaRate}%:`, 130, y);
    doc.text(`${(trip.price * (tvaRate / 100)).toFixed(2)} €`, 170, y); y += 7;
  }
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255);
  doc.rect(120, y - 2, 70, 10, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  const total = s.tvaRegime === 'franchise' ? trip.price : trip.price * (1 + tvaRate / 100);
  doc.text('TOTAL TTC:', 125, y + 5);
  doc.text(`${total.toFixed(2)} €`, 170, y + 5);
  doc.setTextColor(0);

  y += 20;
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Conditions de paiement: à réception. Escompte: néant.', 20, y);

  footer(doc, s);
  doc.save(`facture_${invoiceNum}_${trip.clientName.replace(/\s/g, '_')}.pdf`);

  return { total, tvaAmount: s.tvaRegime === 'franchise' ? 0 : trip.price * (tvaRate / 100) };
}

export function downloadInvoicePDF(inv: InvoiceRecord, s: AppSettings, trip?: Trip) {
  if (trip) {
    generateFacture(trip, s, inv.invoiceNumber);
    return;
  }

  // Fallback if trip object is not in cache
  const doc = new jsPDF();
  header(doc, s);

  const startY = s.vehicleModel || s.vehiclePlate ? 67 : 62;

  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 105, startY, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  doc.setFontSize(10);
  doc.text(`Facture N°: ${inv.invoiceNumber}`, 140, startY + 10);
  doc.text(`Date: ${inv.date || new Date().toLocaleDateString('fr-FR')}`, 140, startY + 16);

  let y = startY + 28;
  doc.setFont('helvetica', 'bold'); doc.text('FACTURER À:', 20, y); y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(inv.clientName || 'Client', 20, y); y += 5;
  if (inv.clientPhone) { doc.text(`Tél: ${inv.clientPhone}`, 20, y); y += 5; }
  y += 7;

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255);
  doc.rect(20, y, 170, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Désignation', 22, y + 6);
  doc.text('Qté', 120, y + 6);
  doc.text('Prix Unit. HT', 135, y + 6);
  doc.text('Total HT', 170, y + 6);
  doc.setTextColor(0);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.text(`Prestation de transport VTC - ${inv.date || ''}`, 22, y);
  doc.text('1', 122, y);
  doc.text(`${(inv.amount || 0).toFixed(2)} €`, 137, y);
  doc.text(`${(inv.amount || 0).toFixed(2)} €`, 170, y);

  y += 18;
  doc.line(120, y, 190, y); y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('Total HT:', 130, y);
  doc.text(`${(inv.amount || 0).toFixed(2)} €`, 170, y); y += 7;
  const tvaRate = s.tvaRate ?? 10;
  if (s.tvaRegime === 'franchise' || inv.tvaAmount === 0) {
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('TVA non applicable (art. 293 B du CGI)', 130, y); y += 7;
  } else {
    doc.text(`TVA ${tvaRate}%:`, 130, y);
    doc.text(`${(inv.tvaAmount || 0).toFixed(2)} €`, 170, y); y += 7;
  }
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255);
  doc.rect(120, y - 2, 70, 10, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC:', 125, y + 5);
  doc.text(`${(inv.totalTTC || inv.amount || 0).toFixed(2)} €`, 170, y + 5);
  doc.setTextColor(0);

  y += 20;
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Conditions de paiement: à réception. Escompte: néant.', 20, y);

  footer(doc, s);
  doc.save(`facture_${inv.invoiceNumber}_${(inv.clientName || 'client').replace(/\s/g, '_')}.pdf`);
}

