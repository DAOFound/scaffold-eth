export function ProposalDetails({ proposal }) {
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
        <button>Vote for this proposal now!</button>
      </>
    );
  }

  return (
    <div>
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
