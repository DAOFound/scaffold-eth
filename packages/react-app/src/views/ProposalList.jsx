import { useEffect, useState } from "react";
import { ProposalDetails } from "../components/ProposalDetails";
import { getProposalDataFromCovalent } from "../helpers/covalent";

function ProposalList({ chainId, mainnetProvider, writeContracts, tx }) {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    if (!chainId) return;
    async function getData() {
      var proposalData = await getProposalDataFromCovalent(chainId);
      setProposals(proposalData);
    }
    getData();
  }, [chainId]);

  return (
    <>
      {Object.values(proposals).map(proposal => (
        <ProposalDetails
          proposal={proposal}
          key={proposal.proposalId}
          mainnetProvider={mainnetProvider}
          writeContracts={writeContracts}
          tx={tx}
        />
      ))}
    </>
  );
}

export default ProposalList;
