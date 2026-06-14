'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Refrigerator } from 'lucide-react';
import PantryWizard from './PantryWizard';

interface Props {
  storageType: 'pantry' | 'fridge';
}

export default function AddItemPage({ storageType }: Props) {
  const router = useRouter();
  const backPath = storageType === 'fridge' ? '/fridge' : '/pantry';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push(backPath)}
          className="p-2 rounded-xl hover:bg-[#eaeaE0] transition-colors text-[#4a4a3a]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {storageType === 'fridge'
            ? <Refrigerator size={24} className="text-blue-500" />
            : <ShoppingBag size={24} className="text-[#5A5A40]" />}
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
            Add to {storageType === 'fridge' ? 'Fridge' : 'Pantry'}
          </h2>
        </div>
      </div>

      <PantryWizard
        storageType={storageType}
        onDone={() => router.push(backPath)}
        onCancel={() => router.push(backPath)}
      />
    </div>
  );
}
