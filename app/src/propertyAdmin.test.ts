import { describe, expect, it } from 'vitest';

const filterByStatus = (properties: Array<{ status: string }>, status?: string) => status ? properties.filter((property) => property.status === status) : properties;

describe('admin property status filtering', () => {
  it('returns only properties matching the selected status', () => {
    const properties = [{ status: 'verification' }, { status: 'published' }, { status: 'verification' }];
    expect(filterByStatus(properties, 'verification')).toHaveLength(2);
    expect(filterByStatus(properties, 'published')).toHaveLength(1);
    expect(filterByStatus(properties)).toHaveLength(3);
  });
});
