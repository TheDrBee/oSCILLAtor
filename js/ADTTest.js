/* Interfacing with transitions taking a user defined ADT:
          scilla_version 0

          library ADTTest

          type AB = | A | B

          contract ADTTest()

          transition ABTest(v: AB)
            ev = {_eventname : "ABTest"; value : v};
            event ev
          end

      Note: only on api's that are upgrded: main or testnet, NOT isolated server
*/


const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { BN, Long, units, bytes } = require('@zilliqa-js/util');
const {
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey } = require('@zilliqa-js/crypto');

async function run()
{
  // Zilliqa b/c setup
  const sc_addr = '0x15ebbcaf2a89d06a8541748cb9af82133008945e'; // address of deployed contract on Testnet
  let setup = {
    "zilliqa": new Zilliqa('https://dev-api.zilliqa.com'),
    "VERSION": bytes.pack(333, 1),
    "priv_keys": ['0564aefa830fb232196761e5802c925479da20d805fcd9cc697c08179503c226',],
    "addresses": [],
    "pub_keys": [],
  };
  setup.priv_keys.forEach( item => {
    setup.zilliqa.wallet.addByPrivateKey(item);// add key to wallet
    setup.addresses.push(getAddressFromPrivateKey(item)); // compute and store address
    setup.pub_keys.push(getPubKeyFromPrivateKey(item)); // compute and store public key
  });
  const tx_settings = {
    "gas_price": units.toQa('2000', units.Units.Li),
    "gas_limit": Long.fromNumber(50000),
    "attempts": Long.fromNumber(10),
    "timeout": 1000,
  };

  try {
    const sc = setup.zilliqa.contracts.at(sc_addr);
    console.log(`sc loaded from ${sc.address}`);
    const code = await setup.zilliqa.blockchain.getSmartContractCode(sc_addr);
    console.log("code of loaded smart contract:\n", code.result.code);

    try {
      const addr = sc.address.toLowerCase();

      // Note the special type and value for a user defined ADT (AB here)
      const args = [ { vname: "v", type: `${addr}.AB`,  value: {constructor: `${addr}.A`, argtypes: [], arguments: [] }},];

      const tx = await sc.call(
        'ABTest',
        args,
        { version: setup.VERSION, amount: new BN(0), gasPrice: tx_settings.gas_price,
          gasLimit: tx_settings.gas_limit,  },
        tx_settings.attempts, tx_settings.timeout, true,
      );

      console.log("tx.receipt:\n",tx.receipt);
      console.log("tx.receipt.event_logs[0].params:\n", tx.receipt.event_logs[0].params);

      } catch (err) {
        console.log("ABTest(.): ERROR\n",err);
    }
  } catch (err) {
    console.log("contracts.at(.): ERROR\n",err);
  }
}

run();
