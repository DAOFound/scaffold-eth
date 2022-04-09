import Address from "./Address";
import { ProposalExecuteButton } from "./ProposalExecuteButton";
import { ProposalVoteButton } from "./ProposalVoteButton";

export function ProposalDetails({ proposal, mainnetProvider, writeContracts, tx }) {
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
        <ProposalVoteButton proposal={proposal} writeContracts={writeContracts} tx={tx} /><br />
        <ProposalExecuteButton proposal={proposal} writeContracts={writeContracts} tx={tx} />
      </>
    );
  }

  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 30 }}>
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
