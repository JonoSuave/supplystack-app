import { getMaterials } from '../actions/firecrawl';
import CrawlButton from '@/components/CrawlButton';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Construction Materials | SupplyStack',
  description: 'Find and manage construction materials for your projects',
};

export default async function MaterialsPage() {
  const { success, data: materials, error } = await getMaterials();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Construction Materials</h1>
          <p className="text-gray-600 mt-1">Find and manage materials for your construction projects</p>
        </div>
        <CrawlButton />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error loading materials: {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {success && materials && materials.length > 0 ? (
          materials.map((material) => (
            <div key={material.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
              {material.thumbnail && (
                <div className="h-48 overflow-hidden relative">
                  <Image 
                    src={material.thumbnail} 
                    alt={material.material_name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{material.material_name}</h2>
                {material.description && (
                  <p className="text-gray-700 mb-2 line-clamp-2">{material.description}</p>
                )}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">${typeof material.price === 'number' ? material.price.toFixed(2) : material.price}</span>
                  {material.quantity && (
                    <span className="text-sm text-gray-500">Quantity: {material.quantity}</span>
                  )}
                </div>
                {material.vendor_name && (
                  <p className="text-sm text-gray-600 mb-3">Vendor: {material.vendor_name}</p>
                )}
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center transition-colors"
                >
                  View Product
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No materials found</h3>
            <p className="text-gray-500 mb-6">Use the Crawl button to fetch construction materials from suppliers</p>
          </div>
        )}
      </div>
    </div>
  );
}
