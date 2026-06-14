'use client';

import Layout from '@/src/components/Layout';
import AddItemPage from '@/src/views/AddItemPage';

export default function AddFridgeItemPage() {
  return (
    <Layout>
      <AddItemPage storageType="fridge" />
    </Layout>
  );
}
