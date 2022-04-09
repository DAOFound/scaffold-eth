import { Button } from "antd";

export function ProposalVoteButton({ proposal, writeContracts, tx }) {
  return (
    <Button
      onClick={async () => {
        const result = tx(writeContracts.DAOFound.voteForProposal(proposal.proposalId), update => {
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
      Vote for this proposal
    </Button>
  );
}
