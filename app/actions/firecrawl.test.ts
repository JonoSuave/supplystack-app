import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crawlAndStoreMaterials } from './firecrawl'; // Adjust path as necessary
import Firecrawl from '@mendable/firecrawl-js';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Mock environment variables
process.env.FIRECRAWL_API_KEY = 'mock-firecrawl-api-key';
process.env.SUPABASE_URL = 'http://mock-supabase-url.com';
process.env.SUPABASE_KEY = 'mock-supabase-anon-key';

// Define mockExtract globally within the test file's scope but outside the mock factory
const mockExtract = vi.fn();

// Mock Firecrawl client
// The default export of '@mendable/firecrawl-js' is the Firecrawl class.
// We mock it with a vi.fn() that acts as a mock constructor.
// This mock constructor, when called (e.g., new Firecrawl({...}) in the SUT),
// returns an object that has an 'extract' method, which is our global 'mockExtract'.
vi.mock('@mendable/firecrawl-js', () => ({
  default: vi.fn(() => ({
    extract: mockExtract,
  })),
}));

// Mock Supabase client
const mockSupabaseUpsert = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseUpdate = vi.fn(); // For sync_status updates
const mockSupabaseEq = vi.fn(); // For .eq() in updates

// This function will be called when supabase.from('table_name') is invoked.
// It needs to return an object with all the methods that might be chained off it (upsert, insert, select, update).
const mockSupabaseFrom = vi.fn((tableName: string) => {
  if (tableName === 'materials') {
    return {
      upsert: mockSupabaseUpsert,
    };
  }
  if (tableName === 'sync_status') {
    return {
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
    };
  }
  // Fallback for any other table, though not expected in this test
  return {}; 
});

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

// Mock environment variables (if your functions rely on process.env directly)
// You might need to set these up if your Supabase client or Firecrawl client
// initialization in the actual code uses process.env.SUPABASE_URL etc.
// For example:
// process.env.SUPABASE_URL = 'your-mock-url';
// process.env.SUPABASE_KEY = 'your-mock-key';
// process.env.FIRECRAWL_API_KEY = 'your-mock-firecrawl-key';


describe('crawlAndStoreMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtract.mockReset();
    mockSupabaseUpsert.mockReset();
    mockSupabaseInsert.mockReset();
    mockSupabaseSelect.mockReset();
    mockSupabaseSingle.mockReset();
    mockSupabaseUpdate.mockReset();
    mockSupabaseEq.mockReset();
    mockSupabaseFrom.mockClear(); // Clear calls to from itself
    (revalidatePath as ReturnType<typeof vi.fn>).mockReset(); // Reset revalidatePath mock

    // Set up return values for chained calls AFTER resetting the mocks
    mockSupabaseInsert.mockReturnValue({ select: mockSupabaseSelect });
    mockSupabaseSelect.mockReturnValue({ single: mockSupabaseSingle });
    mockSupabaseUpdate.mockReturnValue({ eq: mockSupabaseEq });

    // Default mock implementations for successful paths (end of chains)
    mockSupabaseSingle.mockResolvedValue({ data: { id: 'mock-sync-id' }, error: null }); // For sync_status insert().select().single()
    mockSupabaseUpsert.mockResolvedValue({ error: null, data: {}, count: 1 }); // For materials upsert
    mockSupabaseEq.mockResolvedValue({ error: null, data: {} }); // For sync_status update().eq()
  });

  it('should successfully extract data and upsert to Supabase', async () => {
    // Arrange: Setup mock return values
    const mockFirecrawlData = {
      data: {
        products: [
          { product_id: '123', url: 'http://example.com/product/123', material_name: 'Test Material 1', price: 99.99, stock: 'In Stock', thumbnail_url: 'http://example.com/thumb/123.jpg' },
          { product_id: '456', url: 'http://example.com/product/456', material_name: 'Test Material 2', price: 19.50, stock: 'Low Stock', thumbnail_url: 'http://example.com/thumb/456.jpg' },
        ]
      },
      success: true, // Assuming your actual response structure has this
      // Add other properties if your type guard or logic expects them
    };
    mockExtract.mockResolvedValue(mockFirecrawlData); // Configure the global mockExtract
    // mockSupabaseUpsert is now configured in beforeEach for success, can override here if needed for specific test
    // mockSupabaseSingle is also configured in beforeEach for success

    // Act
    const result = await crawlAndStoreMaterials('some-url-pattern');

    // Assert
    // Check if the Firecrawl constructor (which is our mocked vi.fn()) was called
    expect(Firecrawl).toHaveBeenCalledWith({ apiKey: process.env.FIRECRAWL_API_KEY });
    // Check if the extract method (our global mockExtract) was called
    expect(mockExtract).toHaveBeenCalled(); 
    expect(createClient).toHaveBeenCalledWith(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    expect(mockSupabaseFrom).toHaveBeenCalledWith('materials');
    expect(mockSupabaseUpsert).toHaveBeenCalledTimes(1);
    expect(mockSupabaseUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          sku: '123', 
          material_name: 'Test Material 1',
          product_url: 'http://example.com/product/123',
          price: 99.99,
        }),
        expect.objectContaining({
          sku: '456',
          material_name: 'Test Material 2',
          product_url: 'http://example.com/product/456',
          price: 19.50,
        })
      ]),
      expect.objectContaining({ 
        onConflict: 'sku',
        ignoreDuplicates: false,
      })
    );

    expect(result).toEqual({
      success: true,
      count: 1, // This count comes from the mockSupabaseUpsert.mockResolvedValue's count property
      message: "Successfully synced 1 materials for some-url-pattern."
    });
  });

  // TODO: Add more test cases:
  // - Firecrawl returns an error
  // - Firecrawl returns no products
  // - Supabase upsert fails
  // - Sync status table updates correctly
});
