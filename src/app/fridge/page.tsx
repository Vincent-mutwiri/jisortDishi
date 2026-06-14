'use client';

import Layout from '@/src/components/Layout';
import Pantry from '@/src/views/Pantry';

export default function FridgePage() {
  return (
    <Layout>
      <Pantry storageType="fridge" />
    </Layout>
  );
}
