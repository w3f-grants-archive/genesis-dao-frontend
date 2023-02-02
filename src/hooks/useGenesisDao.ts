import type { ISubmittableResult } from '@polkadot/types/types';

import type {
  CreateDaoData,
  DaoInfo,
  IncomingDaoInfo,
  WalletAccount,
} from '../stores/genesisStore';
import useGenesisStore, { TxnResponse } from '../stores/genesisStore';

// fixme open one connection and reuse that connection
const useGenesisDao = () => {
  const addTxnNotification = useGenesisStore((s) => s.addTxnNotification);
  const updateTxnProcessing = useGenesisStore((s) => s.updateTxnProcessing);
  const apiConnection = useGenesisStore((s) => s.apiConnection);
  const fetchDaos = useGenesisStore((s) => s.fetchDaos);

  // fixme currently only handles cancelled error
  const handleTxnError = (err: Error) => {
    let newNoti = {
      title: TxnResponse.Error,
      message: err.message,
      type: TxnResponse.Error,
      timestamp: Date.now(),
    };
    if (err.message.includes('Cancelled')) {
      newNoti = {
        title: TxnResponse.Cancelled,
        message:
          'Please try again. Make sure you sign and approve the transaction using your wallet',
        type: TxnResponse.Warning,
        timestamp: Date.now(),
      };
    }

    updateTxnProcessing(false);
    addTxnNotification(newNoti);
  };

  // fixme need to be able to separate txn types to send different response msgs
  const txResponseCallback = (
    result: ISubmittableResult,
    successMsg: string,
    errorMsg: string
  ) => {
    console.log('Transaction status1:', result.status.type);

    if (result.status.isInBlock) {
      // fixme need to get this block hash
      console.log(
        'Included at block hash',
        result.status.asInBlock.toHex(),
        '\nwait for 10-20 seconds to finalize'
      );
      result.events.forEach(({ event: { data, method, section }, phase }) => {
        if (method === 'ExtrinsicSuccess') {
          updateTxnProcessing(false);
          const successNoti = {
            title: `${TxnResponse.Success}`,
            message: successMsg,
            type: TxnResponse.Success,
            txnHash: result.status.asInBlock.toHex(),
            timestamp: Date.now(),
          };
          // add txn to our store - first index
          addTxnNotification(successNoti);
        }
        if (method === 'ExtrinsicFailed') {
          updateTxnProcessing(false);
          const errorNoti = {
            title: `${TxnResponse.Error}`,
            message: errorMsg,
            type: TxnResponse.Error,
            txnHash: result.status.asInBlock.toHex(),
            timestamp: Date.now(),
          };
          addTxnNotification(errorNoti);
        }
      });
    } else if (result.status.isFinalized) {
      console.log('Finalized block hash', result.status.asFinalized.toHex());
    }
  };

  // fixme I need to be able to see what error I get like duplicated daoId error
  const createDao = (
    walletAccount: WalletAccount,
    { daoId, daoName }: CreateDaoData
  ) => {
    if (walletAccount.signer) {
      apiConnection
        .then(async (api) => {
          api?.tx?.daoCore
            ?.createDao?.(daoId, daoName)
            .signAndSend?.(
              walletAccount.address,
              { signer: walletAccount.signer },
              (result) => {
                txResponseCallback(
                  result,
                  'Congrats! Your DAO is created.',
                  'Something went wrong. Please try again.'
                );
                fetchDaos();
              }
            )
            .catch((err) => {
              updateTxnProcessing(false);
              handleTxnError(new Error(err));
            });
        })
        .catch((err) => {
          updateTxnProcessing(false);
          handleTxnError(new Error(err));
        });
    } else {
      // fixme
      console.log('wallet does not have a signer');
    }
  };

  const getDaos = () => {
    const daos: DaoInfo[] = [];
    apiConnection
      .then((api) => {
        api?.query?.daoCore?.daos
          ?.entries()
          .then((daoEntries) => {
            daoEntries.forEach(([_k, v]) => {
              const dao = v.toHuman() as unknown as IncomingDaoInfo;
              const newObj = {
                daoId: dao.id,
                daoName: dao.name,
                owner: dao.owner,
                assetId: dao.assetId,
              };
              daos.push(newObj);
            });
          })
          .catch((err) => {
            updateTxnProcessing(false);
            handleTxnError(new Error(err));
          });
      })
      .catch((err) => {
        updateTxnProcessing(false);
        handleTxnError(new Error(err));
      });
    return daos;
  };

  const destroyDao = (walletAccount: WalletAccount, daoId: string) => {
    if (walletAccount.signer) {
      apiConnection
        .then((api) => {
          api?.tx?.daoCore
            ?.destroyDao?.(daoId)
            .signAndSend(
              walletAccount.address,
              { signer: walletAccount.signer },
              (result) => {
                txResponseCallback(
                  result,
                  'DAO Destroyed. Bye Bye.',
                  'Something went wrong. Please try again.'
                );
              }
            )
            .catch((err) => {
              updateTxnProcessing(false);
              handleTxnError(new Error(err));

              console.log('destroyDao', new Error(err));
            });
        })
        .catch((err) => {
          updateTxnProcessing(false);
          handleTxnError(new Error(err));
        });
    } else {
      console.log('wallet does not have a signer');
    }
  };

  const issueTokens = (
    walletAccount: WalletAccount,
    daoId: string,
    supply: number
  ) => {
    const amount = supply * 1000000000;
    if (walletAccount.signer) {
      apiConnection
        .then((api) => {
          api?.tx?.daoCore
            ?.issueToken?.(daoId, amount)
            .signAndSend(
              walletAccount.address,
              { signer: walletAccount.signer },
              (result) => {
                txResponseCallback(
                  result,
                  'Tokens Issued',
                  'Something went wrong. Please try again. '
                );
                fetchDaos();
              }
            )
            .catch((err) => {
              updateTxnProcessing(false);
              handleTxnError(new Error(err));
            });
        })
        .catch((err) => {
          updateTxnProcessing(false);
          handleTxnError(new Error(err));
        });
    } else {
      console.log('wallet does not have a signer');
    }
  };

  const transfer = (
    walletAccount: WalletAccount,
    assetId: number,
    toAddress: string,
    amount: number
  ) => {
    const newAmount = amount * 1000000000;
    if (walletAccount.signer) {
      apiConnection
        .then((api) => {
          api?.tx?.assets
            ?.transfer?.(assetId, toAddress, newAmount)
            .signAndSend(
              walletAccount.address,
              { signer: walletAccount.signer },
              (result) => {
                txResponseCallback(
                  result,
                  `Transferred ${amount}`,
                  'Something went wrong. Please try again. '
                );
              }
            )
            .catch((err) => {
              updateTxnProcessing(false);
              handleTxnError(new Error(err));
            });
        })
        .catch((err) => {
          updateTxnProcessing(false);
          handleTxnError(new Error(err));
        });
    } else {
      console.log('wallet does not have a signer');
    }
  };

  return {
    createDao,
    destroyDao,
    issueTokens,
    getDaos,
    handleTxnError,
    transfer,
  };
};

export default useGenesisDao;
