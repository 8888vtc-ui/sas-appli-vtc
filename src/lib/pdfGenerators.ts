import { jsPDF } from 'jspdf';
import type { Trip, AppSettings } from '../types';

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
  doc.text(`${s.companyName} - ${s.companyAddress} - SIRET ${s.siret}`, 20, y + 8);
  doc.text('En cas de retard de paiement: pénalités au taux légal + indemnité forfaitaire de recouvrement de 40€ (clients pro).', 20, y + 12);
  doc.setTextColor(0);
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

  y += 15;
  doc.setFontSize(9);
  doc.text('Signature exploitant:', 20, y);
  doc.text('Signature client:', 120, y);
  doc.rect(20, y + 2, 60, 20); doc.rect(120, y + 2, 60, 20);

  if (trip.signature) {
    try {
      doc.addImage(trip.signature, 'PNG', 122, y + 4, 56, 16);
    } catch (e) {
      console.error('Error adding signature to PDF', e);
    }
  }

  if (trip.notes) {
    y += 30;
    doc.setFontSize(8);
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

  y += 15;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Signature exploitant:', 20, y);
  doc.text('Signature client:', 120, y);
  doc.rect(20, y + 2, 60, 20); doc.rect(120, y + 2, 60, 20);

  if (trip.signature) {
    try {
      doc.addImage(trip.signature, 'PNG', 122, y + 4, 56, 16);
    } catch (e) {
      console.error('Error adding signature to PDF', e);
    }
  }

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
  if (s.tvaRegime === 'franchise') {
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('TVA non applicable (art. 293 B du CGI)', 130, y); y += 7;
  } else {
    doc.text('TVA 10%:', 130, y);
    doc.text(`${(trip.price * 0.1).toFixed(2)} €`, 170, y); y += 7;
  }
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255);
  doc.rect(120, y - 2, 70, 10, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  const total = s.tvaRegime === 'franchise' ? trip.price : trip.price * 1.1;
  doc.text('TOTAL TTC:', 125, y + 5);
  doc.text(`${total.toFixed(2)} €`, 170, y + 5);
  doc.setTextColor(0);

  y += 20;
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Conditions de paiement: à réception. Escompte: néant.', 20, y);

  footer(doc, s);
  doc.save(`facture_${invoiceNum}_${trip.clientName.replace(/\s/g, '_')}.pdf`);

  return { total, tvaAmount: s.tvaRegime === 'franchise' ? 0 : trip.price * 0.1 };
}
