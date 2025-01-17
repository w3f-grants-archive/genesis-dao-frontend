import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import CreateProposal from '@/components/CreateProposal';
import ReviewProposal from '@/components/ReviewProposal';
import WalletConnect from '@/components/WalletConnect';
import useGenesisStore from '@/stores/genesisStore';
import arrowLeft from '@/svg/arrow-left.svg';
import MainLayout from '@/templates/MainLayout';

const CreateProposalPage = () => {
  const currentWalletAccount = useGenesisStore((s) => s.currentWalletAccount);
  const currentDao = useGenesisStore((s) => s.currentDao);
  const apiConnection = useGenesisStore((s) => s.apiConnection);

  const fetchDaoFromDB = useGenesisStore((s) => s.fetchDaoFromDB);
  const createApiConnection = useGenesisStore((s) => s.createApiConnection);
  const updateDaoPage = useGenesisStore((s) => s.updateDaoPage);
  const [page, setPage] = useState('create');
  const router = useRouter();
  const { daoId } = router.query;

  const handleChangePage = (pg: string) => {
    setPage(pg);
  };

  const handleBack = () => {
    updateDaoPage('proposals');
    router.push(`/dao/${encodeURIComponent(daoId as string)}/`);
  };

  useEffect(() => {
    if (!daoId) {
      return;
    }
    const TO = setTimeout(() => {
      fetchDaoFromDB(daoId as string);
    }, 700);
    // eslint-disable-next-line
    return () => clearTimeout(TO);
  }, [daoId, fetchDaoFromDB]);

  useEffect(() => {
    if (!apiConnection) {
      createApiConnection();
    }
    // eslint-disable-next-line
  }, []);

  const display = () => {
    if (!currentWalletAccount?.address) {
      return (
        <div className='flex flex-col items-center justify-center'>
          <p className='text-center'>
            Please connect wallet to continue creating a new Proposal{' '}
            {currentDao?.daoName}
          </p>
          <WalletConnect text='Connect Wallet To Continue' />
        </div>
      );
    }

    if (page === 'review') {
      return (
        <ReviewProposal
          daoId={daoId as string}
          handleChangePage={handleChangePage}
        />
      );
    }

    return (
      <CreateProposal dao={currentDao} handleChangePage={handleChangePage} />
    );
  };

  return (
    <MainLayout
      title='Create a DAO - GenesisDAO'
      description='Create a DAO - GenesisDAO'>
      <div
        className='mt-5 flex w-[65px] items-center justify-between hover:cursor-pointer hover:underline'
        onClick={handleBack}>
        <Image src={arrowLeft} width={13} height={7} alt='arrow-left' />
        <div>Back</div>
      </div>
      <div className='container mx-auto mt-5 mb-16 min-h-[600px] min-w-[600px] max-w-[820px] px-12 py-5'>
        {display()}
      </div>
    </MainLayout>
  );
};

export default CreateProposalPage;
