import { ErrorMessage } from '@hookform/error-message';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { DaoDetail } from '@/stores/genesisStore';

const CreateProposal = (props: { dao: DaoDetail | null }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [hasProposalDeposit, _setHasProposalDeposit] = useState<boolean | null>(
    true
  );
  const onSubmit = (data: any) => {
    console.log(data);
  };

  const watchName = watch('proposalName', '');
  const watchId = watch('proposalId', '');

  const alert = (hasDeposit: boolean | null) => {
    if (hasDeposit) {
      return (
        <div className='alert alert-info shadow-lg'>
          <div>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='h-6 w-6 shrink-0 stroke-current'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
            </svg>
            <p>
              <span className='font-bold'>{`10 ${props.dao?.daoId} Tokens `}</span>
              will be reserved upon creation of your DAO. The reserved tokens
              will be refunded when the DAO is destroyed.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='flex flex-col items-center gap-y-6 px-12'>
      <div>
        <progress
          className='progress progress-primary h-[10px] w-[400px]'
          value='40'
          max='100'></progress>
      </div>
      <div className='text-center'>
        <h2 className='text-primary' data-testid='daoName'>
          New Proposal For {props.dao?.daoName}
        </h2>
        <p className='px-16'>
          {` Creating a proposal is your chance to share your vision, ideas, and expertise. Whether it's a project proposal, a policy change, or a community initiative, your proposal can make a difference and help shape the future of the organization.`}
        </p>
      </div>
      {alert(hasProposalDeposit)}
      <div
        className={`flex w-full items-center ${
          !hasProposalDeposit ? 'text-neutral/30' : null
        }`}>
        <form onSubmit={handleSubmit(onSubmit)} className='min-w-full'>
          <div className='mb-8 flex flex-col items-center gap-y-8'>
            <div className='min-w-full'>
              <div className='flex items-end justify-between'>
                <p className='mb-1 ml-2'>
                  Proposal Name{' '}
                  <span className='text-lg font-medium text-red-600'>*</span>
                </p>
              </div>
              <div className='relative'>
                <input
                  className={`input ${
                    watchName.length > 50 || errors.daoName
                      ? 'input-error'
                      : 'input-primary'
                  }`}
                  type='text'
                  placeholder='e.g. Apple DAO'
                  disabled={!hasProposalDeposit}
                  {...register('proposalName', {
                    required: 'Required',
                    maxLength: { value: 50, message: 'Max length is 50' },
                    minLength: { value: 3, message: 'Minimum length is 3' },
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name='proposalName'
                  render={({ message }) => (
                    <p className='mt-1 ml-2 text-error'>{message}</p>
                  )}
                />
                <p
                  className={`absolute top-2 right-2 opacity-60 ${
                    watchName.length > 50 ? 'text-error' : null
                  }`}>
                  {watchName.length}/50
                </p>
              </div>
            </div>
            <div className='min-w-full'>
              <div className='flex items-end justify-between'>
                <p className='mb-1 ml-2'>
                  Proposal ID{' '}
                  <span className='text-lg font-medium text-red-600'>*</span>
                </p>
                <p className='mb-1 ml-2 text-sm'>
                  Choose from capital A-Z and numbers 0-9(no space)
                </p>
              </div>
              <div className='relative'>
                {/* fixme: Pre fetch all dao names and validate if the dao name exists */}
                <input
                  className={`input ${
                    watchId.length > 8 || errors.daoId
                      ? 'input-error'
                      : 'input-primary'
                  }`}
                  type='text'
                  placeholder='e.g. APPLE'
                  disabled={!hasProposalDeposit}
                  {...register('proposalId', {
                    required: 'Required',
                    maxLength: { value: 8, message: 'Max Length is 8' },
                    minLength: { value: 3, message: 'Minimum length is 3' },
                    pattern: {
                      value: /^[A-Z0-9]+$/,
                      message: 'Only capital A-Z or 0-9(no whitespace)',
                    },
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name='proposalId'
                  render={({ message }) => (
                    <p className='mt-1 ml-2 text-error'>{message}</p>
                  )}
                />
                <p className='ml-2 mt-1'>Proposal ID Cannot be changed after</p>
                <p
                  className={`absolute top-2 right-2 opacity-60 ${
                    watchId.length > 8 ? 'text-error' : null
                  }`}>
                  {watchId.length}/8
                </p>
              </div>
            </div>
            <div className='min-w-full'>
              <p className='mb-1 ml-2'>
                Proposal Description (2000 characters or less)
              </p>
              <textarea
                className='textarea h-64'
                {...register('proposalDescription', {
                  required: 'Required',
                  min: { value: 1, message: 'Minimum character count is 1' },
                  max: { value: 2000, message: 'Max character count is 2000' },
                })}
              />
              <ErrorMessage
                errors={errors}
                name='proposalDescription'
                render={({ message }) => (
                  <p className='mt-1 ml-2 text-error'>{message}</p>
                )}
              />
            </div>
            <div className='min-w-full'>
              <div className='flex items-end justify-between'>
                <p className='mb-1 ml-2'>
                  Discussion Link{' '}
                  <span className='text-lg font-medium text-red-600'>*</span>
                </p>
                <p className='mb-1 ml-2 text-sm'>
                  Add a discussion or forum link
                </p>
              </div>
              <input
                className={`input ${
                  watchId.length > 8 || errors.daoId
                    ? 'input-error'
                    : 'input-primary'
                }`}
                type='text'
                placeholder='https://'
                disabled={!hasProposalDeposit}
                {...register('discussionLink', {
                  required: 'Required',
                  maxLength: { value: 250, message: 'Max Length is 250' },
                  minLength: { value: 8, message: 'Minimum length is 8' },
                  pattern: {
                    value:
                      // eslint-disable-next-line
                      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
                    message: `This does not look like a valid URL. Contact us if this is a mistake.`,
                  },
                })}
              />
              <ErrorMessage
                errors={errors}
                name='discussionLink'
                render={({ message }) => (
                  <p className='mt-1 ml-2 text-error'>{message}</p>
                )}
              />
            </div>
          </div>
          <div className='flex justify-center'>
            <button
              className={`btn-primary btn w-96`}
              type='submit'
              disabled={!hasProposalDeposit}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProposal;
