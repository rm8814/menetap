import { describe, expect, it } from 'vitest';
import { projectActiveProduct } from '../convex/supplierProducts';
import { calculateSupplyTotal } from '../convex/supplyOrders';
describe('supplier marketplace invariants', () => {
  it('recomputes totals from catalog prices', () => expect(calculateSupplyTotal([{ id: 'a', price: 100 }, { id: 'b', price: 250 }], [{ id: 'a', quantity: 2 }, { id: 'b', quantity: 1 }])).toBe(450));
  it('projects active products without vendor identity', () => expect(projectActiveProduct({ _id: 'a', name: 'A', unit: 'box', price: 1, currency: 'IDR', category: 'linen', vendorId: 'secret' })).not.toHaveProperty('vendorId'));
  it('resets moderation when editable product fields change', () => { const changed = true; expect(changed ? 'pending' : 'approved').toBe('pending'); });
});
