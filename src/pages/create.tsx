import { Meta } from '@/components/Meta';
import MainLayout from '@/templates/MainLayout';

import CreateDaoForm from '../components/CreateDaoForm';

const CreateDao = () => {
  return (
    <MainLayout
      meta={
        <Meta
          title='Create a DAO - GenesisDAO'
          description='Create DAO - GenesisDAO'
        />
      }>
      <div className='hero mt-12'>
        <div className='hero-content rounded-xl bg-slate-800 text-center'>
          <div className='max-w-md'>
            <h1 className='text-3xl font-bold'>Create a DAO</h1>
            <CreateDaoForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateDao;
