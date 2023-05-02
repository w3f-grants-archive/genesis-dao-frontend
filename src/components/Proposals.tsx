import Image from 'next/image';
import { useState } from 'react';

// import useGenesisStore from '@/stores/genesisStore';
import { fakeProposals } from '@/stores/placeholderValues';
import downArrow from '@/svg/downArrow.svg';
import plusBlack from '@/svg/plus-black.svg';

import ProposalCard from './ProposalCard';

const Proposals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredProposals = fakeProposals?.filter((prop) => {
    return (
      prop.proposalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.proposalName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const displayProposal = () => {
    if (!filteredProposals || filteredProposals.length === 0) {
      return <div>Sorry no proposals found</div>;
    }
    return (
      <>
        <div className='flex flex-col gap-y-4'>
          {filteredProposals.map((prop) => {
            return <ProposalCard key={prop.proposalId} p={prop} />;
          })}
        </div>
      </>
    );
  };

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateProposal = () => {};
  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <h1 className='text-2xl'>Proposals</h1>
        </div>
        <div className='flex gap-x-4'>
          <div>
            <input
              id='search-input'
              className='input-primary input w-72 text-sm'
              placeholder='Search Proposals'
              onChange={handleSearch}
            />
          </div>
          <div className='flex items-center justify-center'>
            <div className='flex h-12 min-w-[76px] items-center justify-center rounded-full border'>
              <p>All</p>
              <Image
                src={downArrow}
                height={15}
                width={12}
                alt='down-arrow'
                className='ml-2'
              />
            </div>
          </div>
          <div>
            <button
              className='btn-primary btn flex items-center gap-x-1'
              onClick={handleCreateProposal}>
              <Image src={plusBlack} height={16} width={16} alt='plus' />
              <p className='flex items-center pt-[1px]'>New Proposal</p>
            </button>
          </div>
        </div>
      </div>
      <div>{displayProposal()}</div>
    </div>
  );
};

export default Proposals;
