import { describe, expect, it } from 'vitest';
import { analyticsEvents } from './observability';

describe('analytics event taxonomy', () => {
  it('contains the core booking funnel events', () => {
    expect(analyticsEvents).toEqual(expect.arrayContaining(['search_submitted', 'property_viewed', 'checkout_started', 'booking_created']));
  });
});
