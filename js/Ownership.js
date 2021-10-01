/* deploy the Ownership contract and basic interactions   */

const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");
const { BN } = require('@zilliqa-js/util');

async function run()
{
  async function call_IsOwnerCalling()
  {
    const tx = await sc_call(sc, "IsOwnerCalling");
    console.log(`\nevent_logs[0].params[2].value after call to IsOwnerCalling() from account 0:\n`,
      tx.receipt.event_logs[0].params[2].value);
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

    try { // call IsOwnerCalling(.) and log emitted events params indicating if caller was the owner
      await call_IsOwnerCalling();
      try { // call change_owner to change owner to 2nd address and log state
        let new_owner = setup.addresses[1];
        let args = [ { vname: 'new_owner', type: 'ByStr20',  value: new_owner },];
        tx = await sc_call(sc, "ChangeOwner", args);
        state = await sc.getState();
        console.log(`\nevent_logs[0].params[2] after call to ChangeOwner to ${new_owner}:\n`,
          tx.receipt.event_logs[0].params[2]);
        console.log(`owner field in state after call to ChangeOwner(${new_owner}):\n`, state.owner);
        try { // call IsOwnerCalling(.) and log emitted events params indicating if caller was the owner
          await call_IsOwnerCalling();
          try {
            // call ChangeOwnrByOwnerOnly from addresses[0] which is not the owner and log the event
            tx = await sc_call(sc, "ChangeOwnerByOwnerOnly", args);
            console.log(`\n_eventname after calling ChangeOwnrByOwnerOnly from address that is not owner:\n`,
              tx.receipt.event_logs[0]._eventname);
            // call ChangeOwnrByOwnerOnly from addresses[1] which is the owner and change owner back to address[0]
            args = [ { vname: 'new_owner', type: 'ByStr20',  value: setup.addresses[0] },];
            tx = await sc_call(sc, "ChangeOwnerByOwnerOnly", args, new BN('0'), setup.pub_keys[1]);
            console.log(`\n_eventname after calling ChangeOwnrByOwnerOnly from address that is owner:\n`,
              tx.receipt.event_logs[0]._eventname);
            console.log(`owner field in state after call to ChangeOwnrByOwnerOnly:\n`, state.owner);
            try { // the safe version of transfering owner owner_ship
              // call ConfirmOwnershipTransfer before initiating it: will not change owner even if called from owner
              args = [];
              tx = await sc_call(sc, "ConfirmOwnershipTransfer", args);
              console.log(`\n_eventname after calling ConfirmOwnershipTransfer from owner but before Requesting Transfer:\n`,
                tx.receipt.event_logs[0]._eventname);
              // current owner to propose address[1] to be new owner
              args = [ { vname: 'new_owner', type: 'ByStr20',  value: setup.addresses[1] },];
              tx = await sc_call(sc, "RequestOwnershipTransfer", args);
              console.log(`\n_eventname after calling RequestOwnershipTransfer from owner proposing address[1] as new owner:\n`,
                tx.receipt.event_logs[0]._eventname);
              state = await sc.getState();
              console.log(`in state of smart contract: field owner = ${state.owner}`);
              console.log(`    arguments[0] of field pending_owner =`,state.pending_owner.arguments[0]);
              // Try to confirm owner ship from account[2] which is not the proposed new owner
              args = [];
              tx = await sc_call(sc, "ConfirmOwnershipTransfer", args, new BN('0'), setup.pub_keys[2])
              console.log(`\n_eventname after calling ConfirmOwnershipTransfer from an account that is not the proposed new owner:\n`,
                tx.receipt.event_logs[0]._eventname);
              // Confirm owner ship transfer from account[1] which is the proposed new owner
              args = [];
              tx = await sc_call(sc, "ConfirmOwnershipTransfer", args, new BN('0'), setup.pub_keys[1])
              console.log(`\n_eventname after calling ConfirmOwnershipTransfer from account that is the proposed new owner:\n`,
                tx.receipt.event_logs[0]._eventname);
              state = await sc.getState();
              console.log(`in state of smart contract: field owner = ${state.owner}`);
              console.log(`     constructor of field pending_owner =`,state.pending_owner.constructor);

            } catch (err) { console.log("RequestOwnershipTransfer(.)/ConfirmOwnershipTransfer(.): ERROR\n", err); }
          }
          catch (err) { console.log("ChangeOwnerByOwnerOnly(.): ERROR\n", err); }
        }
        catch (err) { console.log("IsOwnerCalling(): ERROR\n",err); }
      }
      catch (err) { console.log("ChangeOwner(.): ERROR\n",err); }
    }
    catch (err) { console.log("IsOwnerCalling(): ERROR\n",err); }
  }
  catch (err) { console.log("deploy_from_file(.): ERROR\n",err); }
}

run();
