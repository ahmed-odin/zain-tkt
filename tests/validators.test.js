import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTicketForm } from '../src/utils/validators.js';

test('validateTicketForm requires a non-empty comments field', () => {
  const errors = validateTicketForm({
    missdn: '1234567890',
    governorate: 'بغداد',
    comments: '   ',
    problemDescription: '',
    status: 'Pending'
  });

  assert.equal(errors.comments, 'validation.requiredComments');
});
