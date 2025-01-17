// import  { decodeAddress, encodeAddress } from '@polkadot/keyring'
// import { hexToU8a, isHex, BN } from '@polkadot/util';

import { ErrorMessage } from '@hookform/error-message';
import { BN } from '@polkadot/util';
import { useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { DAO_UNITS } from '@/config';
import useGenesisDao from '@/hooks/useGenesisDao';
import type { TransferFormValues } from '@/stores/genesisStore';
import useGenesisStore from '@/stores/genesisStore';
import { isValidPolkadotAddress, uiTokens } from '@/utils';

const TransferForm = (props: { assetId: number; daoId: string }) => {
  const { transfer } = useGenesisDao();
  const currentWalletAccount = useGenesisStore((s) => s.currentWalletAccount);
  const txnProcessing = useGenesisStore((s) => s.txnProcessing);
  const updateTxnProcessing = useGenesisStore((s) => s.updateTxnProcessing);
  const handleErrors = useGenesisStore((s) => s.handleErrors);
  const fetchDaoTokenBalance = useGenesisStore((s) => s.fetchDaoTokenBalance);
  const fetchDaoTokenBalanceFromDB = useGenesisStore(
    (s) => s.fetchDaoTokenBalanceFromDB
  );
  const daoTokenBalance = useGenesisStore((s) => s.daoTokenBalance);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
    setValue,
  } = useForm<TransferFormValues>();

  const onSubmit: SubmitHandler<TransferFormValues> = async (
    data: TransferFormValues
  ) => {
    const bnAmount = new BN(data.amount * DAO_UNITS);
    updateTxnProcessing(true);
    if (currentWalletAccount) {
      try {
        await transfer(
          currentWalletAccount,
          props.assetId,
          data.toAddress,
          bnAmount
        );
      } catch (err) {
        handleErrors(new Error(err));
      }
    }
  };

  const buttonText = () => {
    if (!currentWalletAccount) {
      return 'Please Connect Wallet';
    }
    if (txnProcessing) {
      return 'Processing';
    }
    return 'Transfer';
  };

  useEffect(() => {
    setValue('assetId', props.assetId);
    if (isSubmitSuccessful) {
      reset(
        {
          assetId: props.assetId,
          toAddress: '',
          amount: 0,
        },
        { keepErrors: true }
      );
    }
  });

  useEffect(() => {
    if (currentWalletAccount) {
      fetchDaoTokenBalance(props.assetId, currentWalletAccount.address);
      fetchDaoTokenBalanceFromDB(props.assetId, currentWalletAccount.address);
    }
  }, [
    currentWalletAccount,
    fetchDaoTokenBalance,
    fetchDaoTokenBalanceFromDB,
    props.assetId,
  ]);

  return (
    <div>
      <div>
        <div>
          {`Your current ${props.daoId} token balance is ${
            daoTokenBalance
              ? uiTokens(daoTokenBalance, 'dao', props.daoId)
              : '0'
          }`}
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='mb-3'>
          <input
            type='text'
            className='input-bordered input-primary input'
            placeholder='Recipient Address'
            {...register('toAddress', {
              required: 'Required',
              validate: (add) =>
                isValidPolkadotAddress(add) === true || 'Not a valid address',
            })}
          />
          <ErrorMessage
            errors={errors}
            name='toAddress'
            render={({ message }) => (
              <p className='mt-1 ml-2 text-error'>{message}</p>
            )}
          />
        </div>
        <div className='mb-3'>
          <input
            type='number'
            className='input-bordered input-primary input'
            placeholder='Amount'
            {...register('amount', {
              valueAsNumber: true,
              required: 'Required',
              min: {
                value: 0.000001,
                message: 'The Amount is zero or too small',
              },
            })}
          />
          <ErrorMessage
            errors={errors}
            name='amount'
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className='mb-3'>
          <button
            type='submit'
            // disabled={!currentWalletAccount}
            className={`btn-primary btn 
          ${txnProcessing ? `loading` : ``}
          `}
            disabled={!currentWalletAccount}>
            {buttonText()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;
