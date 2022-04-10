import { Button, Divider, Input } from "antd";
import React, { useState } from "react";


export default function CreateProposal({ tx, writeContracts }) {
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [value, setValue] = useState("");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Create proposals UI:</h2>
        <h4>You need NFT token to do it</h4>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            placeholder="Description"
            onChange={e => {
              setDescription(e.target.value);
            }}
          />
          <Input
            placeholder="Recipient"
            onChange={e => {
              setRecipient(e.target.value);
            }}
          />
          <Input
            placeholder="% value"
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.DAOFound.createProposal(description, recipient, value), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Create proposal!
          </Button>
        </div>
      </div>
    </div>
  );
}
