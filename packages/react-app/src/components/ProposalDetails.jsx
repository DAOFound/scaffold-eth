import { Button } from "antd";
import { useEffect, useState } from "react";
import Address from "./Address";
import { ProposalExecuteButton } from "./ProposalExecuteButton";
import { ProposalVoteButton } from "./ProposalVoteButton";

export function ProposalDetails({ proposal, mainnetProvider, writeContracts, tx }) {
  const [locked, setLocked] = useState("locked");

  const checkout = () => {
    window.unlockProtocol && window.unlockProtocol.loadCheckoutModal();
  };

  useEffect(() => {
    const checkUnlock = async () => {
      try {
        await window.unlockProtocol;
        if (window.unlockProtocol) {
          setLocked(window.unlockProtocol.getState());
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkUnlock();
  }, []);

  var completedContent;
  if (proposal.completed) {
    completedContent = (
      <>
        <dt>Funding amount</dt>
        <dd>{proposal.fundingAmount}</dd>
      </>
    );
  } else {
    completedContent = (
      <>
        <ProposalVoteButton proposal={proposal} writeContracts={writeContracts} tx={tx} />
        <br />
        {locked === "locked" ? (
          <Button onClick={checkout}>Unlock Execution</Button>
        ) : (
          <ProposalExecuteButton proposal={proposal} writeContracts={writeContracts} tx={tx} />
        )}
      </>
    );
  }

  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 70 }}>
      <h4>Proposal {proposal.proposalId}</h4>
      <dl>
        <dt>Description</dt>
        <dd>{proposal.description}</dd>

        <dt>Recipient</dt>
        <dd>{proposal.recipient}</dd>

        <dt>Percentage</dt>
        <dd>{proposal.percentage}%</dd>

        {completedContent}
      </dl>
    </div>
  );
}
