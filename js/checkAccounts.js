/* check setup:
    - connection to ceres local server
    - accounts
*/
const { BN, units } = require('@zilliqa-js/util');
const { setup } = require("./blockchain.js");

async function chk_zil_balances()
{
  try {
    for (var i=0; i<setup.addresses.length; i++) {
      const addr = setup.addresses[i];
      const balance = await setup.zilliqa.blockchain.getBalance(addr); // in QA
      const b_zil = units.fromQa(new BN(balance.result.balance), 'zil');
      console.log(`${addr}: ${b_zil} ZIL`);
    }
  } catch (err) {
    console.log("chk_zil_balances(.): ERROR\n",err);
  }
}

chk_zil_balances();
