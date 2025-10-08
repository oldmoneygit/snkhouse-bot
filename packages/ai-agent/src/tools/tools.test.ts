import { describe, it, expect } from 'vitest';
import { searchProducts, getProductDetails, checkStock, executeToolCall } from './handlers';

describe('AI Tools', () => {
  it('deve executar searchProducts', async () => {
    const result = await searchProducts('nike', 3);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('productos');
  });

  it('deve executar executeToolCall corretamente', async () => {
    const result = await executeToolCall('search_products', { 
      query: 'nike', 
      limit: 3 
    });
    expect(result).toBeDefined();
    expect(result).toContain('productos');
  });

  it('deve retornar erro para tool desconhecida', async () => {
    const result = await executeToolCall('unknown_tool', {});
    expect(result).toContain('no encontrada');
  });

  it('deve executar getCategories', async () => {
    const result = await executeToolCall('get_categories', {});
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('Categorías');
  });

  it('deve executar getProductsOnSale', async () => {
    const result = await executeToolCall('get_products_on_sale', { limit: 5 });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
