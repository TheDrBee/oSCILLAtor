/* deploy the Ownership contract and basic interactions   */

const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");

async function run()
{
  async function call_foo()
  {
    const tx = await sc_call(sc, "Foo");
    console.log(`event_logs[0].params[2].value after call to Foo() from account 0:\n`,
      tx.receipt.event_logs[0].params[2]);
  }

  let tx = sc = state = null;
  try { // deploy the contract with account[0] the initial owner
    const init = [
      { vname: '_scilla_version',     type: 'Uint32',   value: '0',},
      { vname: 'owner_at_deployment', type: 'ByStr20',  value: setup.addresses[0] },
    ];
    [tx, sc] = await deploy_from_file("../contracts/Ownership.scilla", init);
    console.log("contract deployed @ ", sc.address);
    state = await sc.getState();
    console.log(`state after deployment from ${setup.addresses[0]}:\n`, state);

    try { // call foo(.) and log emitted events params indicating if caller was the owner
      await call_foo();
      try { // call change_owner to change owner to 2nd address and log state
        const new_owner = setup.addresses[1];
        const args = [ { vname: 'new_owner', type: 'ByStr20',  value: new_owner },];
        tx = await sc_call(sc, "ChangeOwner", args);
        state = await sc.getState();
        console.log(`event_logs[0].params[2] after call to ChangeOwner to ${new_owner}:\n`,
          tx.receipt.event_logs[0].params[2]);
        console.log(`state after call to ChangeOwner(${new_owner}):\n`, state);
        try { // call foo(.) and log emitted events params indicating if caller was the owner
          await call_foo();
        } catch (err) {
          console.log("Foo(): ERROR\n",err);
        }
      } catch (err) {
        console.log("ChangeOwner(.): ERROR\n",err)
      }
    } catch (err) {
      console.log("Foo(): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
