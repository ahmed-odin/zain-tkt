import * as XLSX from 'xlsx';
import { formatDateTime } from './dateFormatter';

const MISSDSN_HEADERS = ['missdn', 'missdsn', 'msisdn', 'msisdn', 'phone', 'phone number', 'mobile', 'mobile number', 'رقم', 'رقم الهاتف'];
const GOVERNORATE_HEADERS = ['governorate', 'province', 'state', 'region', 'area', 'محافظة', 'المحافظة', 'المحافظه', 'governorate/المحافظة', 'governorate | المحافظة'];
const COMMENTS_HEADERS = ['comments', 'comment', 'تعليق', 'تعليقات', 'remarks', 'ملاحظات'];
const NOTES_HEADERS = ['notes', 'note', 'description', 'description', 'ملاحظات', 'ملاحظة', 'notes/description', 'notes | description'];

const GOVERNORATE_ALIASES = {
  baghdad: 'بغداد',
  بغداد: 'بغداد',
  basra: 'البصرة',
  basrah: 'البصرة',
  البصرة: 'البصرة',
  mosul: 'الموصل',
  الموصل: 'الموصل',
  kirkuk: 'كركوك',
  كركوك: 'كركوك',
  anbar: 'الأنبار',
  'al-anbar': 'الأنبار',
  الأنبار: 'الأنبار',
  salahuddin: 'صلاح الدين',
  'salah al din': 'صلاح الدين',
  'salah al-din': 'صلاح الدين',
  'صلاح الدين': 'صلاح الدين',
  diwaniya: 'ديالى',
  ديالى: 'ديالى',
  wasit: 'واسط',
  'واسط': 'واسط',
  babel: 'بابل',
  babil: 'بابل',
  'بابل': 'بابل',
  karbala: 'كربلاء',
  'كربلاء': 'كربلاء',
  najaf: 'النجف',
  'النجف': 'النجف',
  muthanna: 'المثنى',
  'المثنى': 'المثنى',
  thiqar: 'ذي قار',
  'ذي قار': 'ذي قار',
  missan: 'ميسان',
  'ميسان': 'ميسان',
  nineveh: 'نينوى',
  'نينوى': 'نينوى'
};

export const VALID_GOVERNORATES = Array.from(new Set(Object.values(GOVERNORATE_ALIASES)));

function normalizeValue(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function normalizeMissdn(value) {
  const digits = String(value).replace(/\D/g, '');
  if (/^\d{10}$/.test(digits)) {
    return digits;
  }
  if (/^0\d{10}$/.test(digits)) {
    return digits.slice(-10);
  }
  if (/^(?:00964|964)\d{10}$/.test(digits)) {
    return digits.slice(-10);
  }
  return digits;
}

function normalizeHeader(value) {
  return normalizeValue(value).toLowerCase().replace(/\s+/g, ' ');
}

function mapHeaderName(header) {
  const normalized = normalizeHeader(header);
  if (MISSDSN_HEADERS.includes(normalized) || normalized.includes('miss') || normalized.includes('phone')) return 'missdn';
  if (GOVERNORATE_HEADERS.includes(normalized) || normalized.includes('governorate') || normalized.includes('province') || normalized.includes('محافظ')) return 'governorate';
  if (COMMENTS_HEADERS.includes(normalized) || normalized.includes('comment') || normalized.includes('remark')) return 'comments';
  if (NOTES_HEADERS.includes(normalized) || normalized.includes('note') || normalized.includes('description')) return 'notes';
  return null;
}

export function readExcelFile(file) {
  if (!(file instanceof File)) {
    throw new Error('A valid Excel file is required.');
  }

  const filename = file.name.toLowerCase();
  const supported = /\.(xlsx|xls|ods|csv)$/i.test(filename);
  if (!supported) {
    throw new Error('Unsupported file type. Use .xlsx, .xls, .ods, or .csv.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {
          type: 'array',
          raw: true,
          defval: ''
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error('Unable to read the first worksheet.');
        }

        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
          defval: ''
        });

        resolve({ data: rawRows, sheetName });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
}

function detectHeaderRow(row) {
  if (!Array.isArray(row)) return false;
  const matches = row.map(mapHeaderName).filter(Boolean).length;
  return matches >= 2;
}

function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(3, rows.length); i += 1) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    if (detectHeaderRow(row)) {
      return i;
    }
  }
  return null;
}

function normalizeGovernorate(value) {
  const raw = normalizeValue(value);
  if (!raw) return '';
  const key = raw.toLowerCase();
  return GOVERNORATE_ALIASES[key] || raw;
}

function isKnownGovernorate(value) {
  const key = normalizeValue(value).toLowerCase();
  return Object.prototype.hasOwnProperty.call(GOVERNORATE_ALIASES, key);
}

// Build a ticket row from explicitly resolved column indexes (works regardless
// of column order — LTR or RTL sheets).
function buildRowObject(row, cols) {
  const normalized = row.map(normalizeValue);
  return {
    missdn: cols.missdn !== undefined ? (normalized[cols.missdn] || '') : '',
    governorate: cols.governorate !== undefined ? (normalized[cols.governorate] || '') : '',
    comments: cols.comments !== undefined ? (normalized[cols.comments] || '') : '',
    notes: cols.notes !== undefined ? (normalized[cols.notes] || '') : '',
    allowMissingGovernorate: cols.governorate === undefined
  };
}

function buildHeaderMap(headerRow) {
  const map = {};
  headerRow.forEach((cell, index) => {
    const key = mapHeaderName(cell);
    if (key && map[key] === undefined) {
      map[key] = index;
    }
  });
  return map;
}

function isRowEmpty(row) {
  return row.every((cell) => normalizeValue(cell) === '');
}

function isValidMissdnCell(value) {
  const digits = String(value).replace(/\D/g, '');
  return /^\d{10}$/.test(digits)
    || /^0\d{10}$/.test(digits)
    || /^(?:00964|964)\d{10}$/.test(digits);
}

/**
 * Resolve which column holds the MISSDN / governorate / comments by scanning
 * the data — so the import works whether columns are ordered left-to-right
 * (MISSDN first) or right-to-left (governorate first), with or without headers.
 * Header-provided indexes always take priority.
 */
function resolveColumns(dataRows, headerMap) {
  const cols = { ...headerMap };
  const rows = dataRows.filter((r) => Array.isArray(r) && !isRowEmpty(r)).slice(0, 50);

  let maxCols = 0;
  rows.forEach((r) => { maxCols = Math.max(maxCols, r.length); });

  const stats = [];
  for (let i = 0; i < maxCols; i += 1) {
    stats[i] = { phone: 0, filled: 0, length: 0, known: 0 };
  }

  rows.forEach((r) => {
    for (let i = 0; i < maxCols; i += 1) {
      const v = normalizeValue(r[i]);
      if (!v) continue;
      stats[i].filled += 1;
      stats[i].length += v.length;
      if (isValidMissdnCell(v)) stats[i].phone += 1;
      if (isKnownGovernorate(v)) stats[i].known += 1;
    }
  });

  const avgLen = (s) => (s.filled ? s.length / s.filled : 0);

  // MISSDN: the column with the most phone-like values.
  if (cols.missdn === undefined) {
    let best = -1;
    let bestCount = 0;
    stats.forEach((s, i) => { if (s.phone > bestCount) { bestCount = s.phone; best = i; } });
    if (best >= 0) cols.missdn = best;
  }

  // Governorate: prefer the column with the most recognized governorate names;
  // otherwise the shortest-text column (governorate names are short, comments are long).
  if (cols.governorate === undefined) {
    const candidates = stats
      .map((s, i) => ({ i, ...s }))
      .filter((c) => c.i !== cols.missdn && c.i !== cols.comments && c.filled > 0);

    const known = candidates.filter((c) => c.known > 0).sort((a, b) => b.known - a.known);
    if (known.length) {
      cols.governorate = known[0].i;
    } else if (candidates.length) {
      candidates.sort((a, b) => avgLen(a) - avgLen(b));
      cols.governorate = candidates[0].i;
    }
  }

  // Comments: the remaining filled column with the longest text.
  if (cols.comments === undefined) {
    const candidates = stats
      .map((s, i) => ({ i, ...s }))
      .filter((c) => c.i !== cols.missdn && c.i !== cols.governorate && c.filled > 0);
    if (candidates.length) {
      candidates.sort((a, b) => avgLen(b) - avgLen(a));
      cols.comments = candidates[0].i;
    }
  }

  return cols;
}

function validateImportRow(ticket, rowIndex) {
  const errors = [];
  const warnings = [];
  const missdnValue = normalizeMissdn(ticket.missdn);
  if (!missdnValue || !/^\d{10}$/.test(missdnValue)) {
    errors.push(`Row ${rowIndex}: Invalid MISSDN (must be exactly 10 digits)`);
  }

  const governorate = normalizeGovernorate(ticket.governorate);
  if (!governorate && !ticket.allowMissingGovernorate) {
    errors.push(`Row ${rowIndex}: Invalid Governorate (${ticket.governorate || 'empty'})`);
  }

  if (ticket.comments.length > 500) {
    errors.push(`Row ${rowIndex}: Comments must not exceed 500 characters`);
  }

  if (!ticket.comments && ticket.notes) {
    warnings.push(`Row ${rowIndex}: Notes were found without a Comments column; they have been merged into the comment field.`);
  }

  return {
    normalizedMissdn: missdnValue,
    governorate,
    combinedComments: [ticket.comments, ticket.notes].filter(Boolean).join(' | ').slice(0, 500),
    errors,
    warnings
  };
}

export function exportCompletedTicketsToExcel(completedTickets) {
  const data = completedTickets.map((ticket) => ({
    'رقم': `#${ticket.id}`,
    'MISSDN': ticket.missdn,
    'المحافظة': ticket.governorate,
    'الحالة': 'مكتملة',
    'بواسطة': ticket.createdBy,
    'مكتمل بواسطة': ticket.completedBy || '',
    'تاريخ الإنشاء': formatDateTime(ticket.createdAt),
    'تاريخ الإتمام': formatDateTime(ticket.completedAt),
    'تعليق': ticket.comments || '',
    'شركة الوسيط': ticket.problemDescription || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data, {
    header: ['رقم', 'MISSDN', 'المحافظة', 'الحالة', 'بواسطة', 'مكتمل بواسطة', 'تاريخ الإنشاء', 'تاريخ الإتمام', 'تعليق', 'شركة الوسيط'],
    origin: 'A1'
  });

  ws['!cols'] = [
    { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 24 }, { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Completed Tickets');

  const date = new Date();
  const filename = `completed_tickets_${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export async function parsePendingTicketsExcel(file) {
  const { data: rawRows } = await readExcelFile(file);

  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      errors: [{ message: 'The file is empty.' }],
      warnings: [],
      validTickets: []
    };
  }

  const headerRowIndex = findHeaderRow(rawRows);
  const hasHeader = headerRowIndex !== null;
  const headerRow = hasHeader ? rawRows[headerRowIndex] : [];
  const headerMap = hasHeader ? buildHeaderMap(headerRow) : {};
  const dataRows = hasHeader ? rawRows.slice(headerRowIndex + 1) : rawRows;
  const cols = resolveColumns(dataRows, headerMap);

  const result = {
    totalRows: 0,
    validRows: 0,
    errors: [],
    warnings: [],
    validTickets: []
  };

  if (cols.missdn === undefined) {
    result.errors.push({ message: 'MISSDN column not found in the file.' });
    return result;
  }

  dataRows.forEach((row, index) => {
    if (!Array.isArray(row) || isRowEmpty(row)) {
      return;
    }

    const excelRowIndex = headerRowIndex !== null ? headerRowIndex + index + 2 : index + 1;
    const ticketRow = buildRowObject(row, cols);
    const validation = validateImportRow(ticketRow, excelRowIndex);

    result.totalRows += 1;

    if (validation.errors.length > 0) {
      validation.errors.forEach((message) => {
        result.errors.push({ row: excelRowIndex, message });
      });
      return;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach((message) => {
        result.warnings.push({ row: excelRowIndex, message });
      });
    }

    result.validRows += 1;
    result.validTickets.push({
      missdn: validation.normalizedMissdn,
      governorate: validation.governorate || ticketRow.governorate,
      comments: validation.combinedComments,
      status: 'Pending',
      problemDescription: ''
    });
  });

  return result;
}
