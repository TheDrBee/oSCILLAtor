/* deploy the Funds contract and basic interactions:
    - deposit in smart contract
    - withdraw some funds from contract
    - withdraw all remaining funds from contract (empty it) */
const { BN, Long, units } = require('@zilliqa-js/util');
const {
  toBech32Address,
  fromBech32Address } = require('@zilliqa-js/crypto');

const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");

// get balance of an address on the blockchain
async function get_zil_bal_for_address(addr)
{
  const balance = await setup.zilliqa.blockchain.getBalance(addr); // in QA
  const b_zil = units.fromQa(new BN(balance.result.balance), 'zil');
  console.log(`${addr}: ${b_zil} ZIL`);
}

// check balnces of all addresses (accounts) in the setup
async function chk_zil_balances()
{
  try {
    for (var i=0; i<setup.addresses.length; i++) {
      const addr = setup.addresses[i];
      await get_zil_bal_for_address(addr);
    }
  } catch (err) {
    console.log("chk_zil_balances(.): ERROR\n",err);
  }
}

// transfer funds between two accounts
async function funds_transfer_between_accounts()
{
  try {
    console.log("initial balances of all accounts:");
    await chk_zil_balances();
    const a = setup.addresses;
    // send a tx from account[0] to transfer 100 ZIL to account[1]
    const amt = units.toQa(100, 'zil');

    const sender = setup.pub_keys[0];
    const receipient = toBech32Address(a[1].toLowerCase());

    console.log(`  sending ${amt} QA to ${receipient} (${fromBech32Address(receipient)})`); // check it gives back a[1]!
    const params = {
      version: setup.VERSION,
      pubKey: sender, // not needed here as a[0] is default account anyways
      toAddr: receipient,
      amount: amt,
      gasPrice: units.toQa('2000', units.Units.Li),
      gasLimit: Long.fromNumber(50),
    };
    const priority_flag = false;
    let tx = await setup.zilliqa.blockchain.createTransactionWithoutConfirm(
      setup.zilliqa.transactions.new(params, priority_flag)
    );

    // wait until tx is confirmed by using its tx id
    const tx_conf = await tx.confirm(tx.id);
    const gas = new BN(tx_conf.receipt.cumulative_gas).mul(new BN(params.gasPrice)); // gas spent times cost of 1 unit of gas
    console.log(`  gas spent: ${gas} QA = ${units.fromQa(gas,'zil')} ZIL`);

    // new balances: note that a[1] has amt more and a[0] has (amt + gas) less
    console.log("final balances of all accounts:");
    await chk_zil_balances();

  } catch (err) {
    console.log("funds_transfer_between_accounts(.): ERROR\n",err);
  }
}

async function funds_to_and_from_contract()
{
  async function log_it(c, tx)
  {
    state = await c.getState();
    console.log(`tx.receipt.event_logs[0]:`, tx.receipt.event_logs[0]);
    console.log(`_balance in state [ZIL] = ${units.fromQa(new BN(state._balance), 'zil')}`);
  }

  let tx = sc = amount = state = args = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version',     type: 'Uint32',   value: '0',} ];
    [tx, sc] = await deploy_from_file("../contracts/Funds.scilla", init);
    console.log("contract deployed @ ", sc.address);
    try { // deposit 100 ZIL from account 0
      amount = units.toQa('100', 'zil');
      tx = await sc_call(sc, "AddFunds", [], amount);
      await log_it(sc, tx);
      try { // withdraw 60 ZIL
        amount = units.toQa('60', 'zil');
        args = [ { vname: 'amount', type: 'Uint128',  value: amount.toString() },];
        tx = await sc_call(sc, 'Withdraw', args);
        await log_it(sc, tx);
        try { // withdraw 70 ZIL (more than remaining balance of 40 ZIL)
          amount = units.toQa('70', 'zil');
          args = [ { vname: 'amount', type: 'Uint128',  value: amount.toString() },];
          tx = await sc_call(sc, 'Withdraw', args);
          await log_it(sc, tx);
          try { // withdraw everything remaining
            tx = await sc_call(sc, 'Empty');
            await log_it(sc, tx);
          } catch (err) {
            console.log("Empty(): ERROR\n",err);
          }
        } catch (err) {
          console.log("Withdraw(): ERROR\n",err);
        }
      } catch (err) {
        console.log("Withdraw(): ERROR\n",err);
      }
    } catch (err) {
      console.log("Deposit(): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

//chk_zil_balances();
//funds_transfer_between_accounts();
funds_to_and_from_contract();
