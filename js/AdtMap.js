/* deploy the AdtMap contract, add and remove entries  */
const { BN  } = require('@zilliqa-js/util');
const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");

async function run()
{
  async function log_players()
  {
    const m = await sc.getSubState('players');
    console.log(` stringified field players:\n`, JSON.stringify(m));
  }

  async function add(age, is_tennis, acc_index)
  {
    const transition = is_tennis ? "AddTennis" : "AddRun";
    const args = [ { vname: 'age', type: 'Uint32',  value: age.toString() },];
    console.log("add " + setup.addresses[acc_index]
      + ": age = " + age + ", sport = " + (is_tennis ? "Tennis" : "Run"))
    const tx = await sc_call(sc, transition, args, new BN(0), setup.pub_keys[acc_index]);
    await log_players();
  }

  let tx = sc = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version',     type: 'Uint32',   value: '0',}, ];
    [tx, sc] = await deploy_from_file("../contracts/AdtMap.scilla", init);
    console.log("contract deployed @ ", sc.address);
    try { // add account 0 as a tennis player of age 25
      await add(25, true, 0);
      try { // add account 1 as a runner of age 30
        await add(30, false, 1);
        try { // change the age of account 0 to 18
          const args = [ { vname: 'new_age', type: 'Uint32',  value: '18' },];
          console.log("change age to 18 of " + setup.addresses[0]);
          tx = await sc_call(sc, 'change_age', args);
          await log_players();
          try { // overwrite the account 1 to tennis player of age 35
            await add(35, true, 1);
            try { // remove the player from account 0 from the map
              console.log("Remove " + setup.addresses[0]);
              tx = await sc_call(sc, 'Remove');
              await log_players();
            } catch (err) {
              console.log("Remove(): ERROR\n",err)
            }
          } catch (err) {
            console.log("add(.): ERROR\n",err)
          }
        } catch (err) {
          console.log("ChangeAge(.): ERROR\n",err)
        }
      } catch (err) {
        console.log("add(.): ERROR\n",err);
      }
    } catch (err) {
      console.log("add(.): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
