'use client';

import Layout from '@/src/components/Layout';
import AddItemPage from '@/src/views/AddItemPage';

export default function AddPantryItemPage() {
  return (
    <Layout>
      <AddItemPage storageType="pantry" />
    </Layout>
  );
}
