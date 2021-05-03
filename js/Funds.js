/* deploy the Funds contract and basic interactions:
    - deposit in smart contract
    - withdraw some funds from contract
    - withdraw all remaining funds from contract (empty it) */
const { BN, units } = require('@zilliqa-js/util');
const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");

async function run()
{
  async function log_it(c, tx)
  {
    state = await c.getState();
    console.log(`tx.receipt.event_logs[0]:`, tx.receipt.event_logs[0]);
    console.log(`_balance in state in ZIL = ${units.fromQa(new BN(state._balance), 'zil')}`);
  }

  let tx = sc = amount = state = args = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version',     type: 'Uint32',   value: '0',} ];
    [tx, sc] = await deploy_from_file("../contracts/Funds.scilla", init);
    console.log("contract deployed @ ", sc.address);
    try { // deposit 100 ZIL from account 0
      amount = units.toQa('100', 'zil');
      tx = await sc_call(sc, "Deposit", [], amount);
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

run();
